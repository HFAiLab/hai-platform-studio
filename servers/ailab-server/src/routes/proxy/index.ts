import urllib from 'url'
import type { TokenConfig } from '@hai-platform/studio-schemas/lib/cjs/bff/proxy'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import curlirize from 'axios-curlirize'
import type Router from 'koa-router'
import qs from 'qs'
import { logger } from '../../base/logger'
import { getWorkerUserInfoLegacy } from '../../biz/quota'
import { GlobalConfig } from '../../config'
import { serverMonitor } from '../../monitor'
import { appendQuery } from '../../utils/url'
import { proxyApiCount, proxyErrorCount } from './metrics'
import { judgeAlertIgnore, judgeInWhiteList } from './whitelist'

interface SafeResult {
  pass: boolean
  msg: string
  safeUrl?: string
  safeUrlInstance?: urllib.URL
  safeConfigs?: AxiosRequestConfig
}

// 错误类型，需要上报 prom
enum ErrorTypes {
  SecurityCheckFailed = 'SecurityCheckFailed', // 安全检查错误，比如请求的域名不在白名单
  TokenNotFound = 'TokenNotFound', // headers 里面没有 token
  RequestEntityError = 'RequestEntityError', // 请求/响应无法解析
  Timeout = 'Timeout', // 超时，超时时间为使用者传入
  UnknownServerError = 'UnknownServerError', // 不知道为什么的错误
}

const proxyAxios = axios.create()

if (GlobalConfig.ENABLE_ONLINE_DEBUG)
  curlirize(proxyAxios, (result) => {
    const { command } = result
    logger.info(`[proxy] request to curl: ${command}`)
  })

// 针对不同 url，获取不同的超时报警时间
export const getReqLongTimeByURL = (url: string) => {
  if (url.includes('/delete_files')) {
    return 5 * 60 * 1000
  }
  if (url.includes('/list_cluster_files')) {
    return 60 * 1000
  }
  if (url.includes('ugc/sync_from_cluster/status') || url.includes('ugc/sync_to_cluster/status')) {
    return 30 * 1000
  }
  if (url.includes('ugc/sync_from_cluster') || url.includes('ugc/sync_to_cluster')) {
    return 60 * 1000
  }
  if (url.includes('ugc/get_sts_token')) {
    return 30 * 1000
  }
  return 10 * 1000 // 对于一般的请求，超过 10s，被认为是长时间的请求
}

function stepSafeTest(url: string, configs: AxiosRequestConfig): SafeResult {
  // hint: URL 解析构造可以达到 2w+ 的 ops，直接做掉就行
  const urlParsed = new urllib.URL(url)
  const inWhiteList = judgeInWhiteList(urlParsed)
  if (!inWhiteList) return { pass: false, msg: 'url not in whitelist' }

  // host 字段比较特殊，需要这样处理一下
  const washedConfigs = { ...configs }
  if (!washedConfigs.headers) washedConfigs.headers = {}
  // hint: host 优先从用户配置中读取
  if (!washedConfigs.headers.host) washedConfigs.headers.host = urlParsed.host

  return {
    pass: true,
    msg: 'ok',
    safeUrl: urlParsed.href,
    safeConfigs: washedConfigs,
    safeUrlInstance: urlParsed,
  }
}

function stepCheckToken(
  url: string,
  configs: AxiosRequestConfig,
  token: string,
  withToken: TokenConfig | undefined,
) {
  if (withToken) {
    // eslint-disable-next-line no-param-reassign
    token = `${withToken.prefix || ''}${token}${withToken.suffix || ''}`
    switch (withToken.position) {
      case 'body':
        if (!configs.data) configs.data = {}
        configs.data.token = token
        break
      case 'header':
        if (!configs.headers) configs.headers = {}
        configs.headers.token = token
        break
      case 'url':
        // eslint-disable-next-line no-param-reassign
        url = appendQuery(url, 'token', token)
        break
      case 'queryPath':
        // eslint-disable-next-line no-param-reassign
        url += `/${token}`
        break
      default:
        break
    }
  }

  return {
    url,
    configs,
  }
}

function reportError(token: string, url: string, errorType: ErrorTypes) {
  logger.error(`[bff proxy] report error: ${url}, token: ${token}, errorType: ${errorType}`)
  const urlInstance = new urllib.URL(url)
  proxyErrorCount.inc({
    host: urlInstance.host,
    path: urlInstance.pathname,
    errType: errorType,
    token,
  })
}

function register(router: Router) {
  // 后面可能需要更多的图片服务，需要类似的逻辑：
  // router.get('/log_image', async (ctx, next) => {
  //   ctx.set('Content-Type', 'image/svg+xml')
  //   await next()
  // })

  router.post('/s', async (ctx, next) => {
    const inputUrl = ctx.request.body.url
    const inputConfigs = ctx.request.body.config as AxiosRequestConfig
    const withToken = ctx.request.body.withToken as TokenConfig | undefined
    const token = (ctx.request.headers.token as string) || ''

    // step0: 必须要有 token
    if (!token) {
      ctx.response.status = 403
      ctx.response.body = {
        proxyError: ErrorTypes.TokenNotFound,
      }
      reportError(token, inputUrl, ErrorTypes.TokenNotFound)
      return
    }

    // step1: 安全监测
    const checkRes = stepSafeTest(inputUrl, inputConfigs)

    if (!checkRes.pass) {
      ctx.response.status = 403
      ctx.response.body = {
        proxyError: ErrorTypes.SecurityCheckFailed,
      }
      reportError(token, inputUrl, ErrorTypes.SecurityCheckFailed)
      return
    }

    // step2：把 token 挪动到正确的位置上去
    const { url, configs } = stepCheckToken(
      checkRes.safeUrl!,
      checkRes.safeConfigs!,
      token,
      withToken,
    )

    const labels = {
      path: checkRes.safeUrlInstance!.pathname,
      host: checkRes.safeUrlInstance!.host,
    }
    proxyApiCount.inc(labels, 1)

    let longTimeId: NodeJS.Timeout
    try {
      const reqLongTime = getReqLongTimeByURL(url)

      longTimeId = setTimeout(() => {
        if (judgeAlertIgnore(url)) return
        logger.error(
          `[proxy warning], req more than ${reqLongTime}, url: ${url}, configs: ${JSON.stringify(
            configs,
          )}`,
        )
      }, reqLongTime)

      if (configs?.headers?.['x-custom-host']) {
        configs.headers.Host = configs.headers['x-custom-host']
      }

      const res = await proxyAxios(
        url,
        Object.assign(configs, {
          transformResponse: (data: string) => {
            return data
          },
          paramsSerializer: (params: any) => qs.stringify(params, { arrayFormat: 'repeat' }),
        }),
      )
      // if (GlobalConfig.ENABLE_ONLINE_DEBUG)
      //   logger.info(`proxy request ${url} receive data:`, res.data)
      clearTimeout(longTimeId)
      ctx.response.body = res.data
      ctx.set('Content-Type', res.headers['content-type']!)
      ctx.set('x-cache-status', res.headers['x-cache-status']!)
      ctx.set('client-version', res.headers['client-version']!)
      return
    } catch (e: any) {
      if (GlobalConfig.ENABLE_ONLINE_DEBUG) logger.info(`proxy request ${url} receive error:`, e)
      clearTimeout(longTimeId! as NodeJS.Timeout)
      if (e.code && e.code === 'ECONNABORTED') {
        ctx.response.status = 500
        ctx.response.body = {
          proxyError: ErrorTypes.Timeout,
          message: e.message || 'Timeout Error',
          success: 0,
        }
        // hint timeout 的上面其实有了，这里暂时不报错了
        return
      }
      reportError(token, url, ErrorTypes.RequestEntityError)

      console.error('[proxy receive error]:', e) // 这个信息可能非常长，只在 k8s 的 log 里面，可以 Kubectl logs xxx > 1.log 这样导出
      logger.error('[proxy receive error]:', e.message)

      const ignoreEmitToFetal = e && e.response && e.response.status && e.response.status < 500

      if (!ignoreEmitToFetal) {
        serverMonitor.reportV2AxiosError(e as AxiosError)
      }

      ctx.response.body = e.response
        ? e.response.data
        : {
            proxyError: ErrorTypes.UnknownServerError,
            message: e.message || '',
            success: 0,
          }
      ctx.response.status = e.response ? e.response.status : 500
    }
    await next()
  })
}

export default register
