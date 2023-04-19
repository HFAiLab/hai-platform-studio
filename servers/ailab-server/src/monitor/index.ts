import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import axios, { AxiosError } from 'axios'
import { logger } from '../base/logger'
import type {
  FetionReportAxiosPayload,
  FetionReportBFFErrorPayload,
  FetionReportBFFNoticePayload,
} from '../biz/agg-fetion/schema'
import { GlobalConfig, isLocalDebug } from '../config'

export enum FetionMonitorType {
  PUBLIC = 'PUBLIC', // 一般的纯文本，发到宣传组的群里
  BFF_TEXT_ERROR = 'BFF_TEXT_ERROR', // bff 的通常的 error
  PROXY = 'PROXY ', // proxy 请求报错
  SOCKET_REQUEST = 'SOCKET_REQUEST', // 长链接请求报错
}

export interface FetionReportInfo {
  monitorType: FetionMonitorType
  keyword: string // 如果是 proxy 或者 socket_request，这里应该填写一个便于区分的 url
  content: string
}

export enum FetalErrorTypes {
  clusterConsumerError = 'clusterConsumerError', // 消费集群 redis 信息出错
  unreachableError = 'unreachableError', // 走到了代码中不应该到达的地方，相当于 assert !false
  proxyRequestError = 'proxyRequestError', // proxy 的告警
  studioAdminReportOutdated = 'studioAdminReportOutdated', // 过期预警
  influx3fsQueryError = 'influx3fsQueryError', // influx_3fs 查询超时等问题报错
  bizTerminalRunCMDError = 'bizTerminalRunCMDError', // 交互式命令行出错
  datasetRequestSTSTokenFailed = 'datasetRequestSTSTokenFailed', // 申请数据集用户上传 stsToken 出错
  autoDetectInternal500 = 'autoDetectInternal500', // try catch 兜底的错误，返回 500
  xTopicLikeSuspectedAttack = 'xTopicLikeSuspectedAttack', // 非正常途径点赞
  apiFetchError = 'apiFetchError', // 萤火 API 请求出错
  userLastActivityNotFound = 'userLastActivityNotFound', // 用户最近活跃时间，如果没有的话会影响长链接的更新
}

export enum ImportantInfoTypes {
  datasetUploadRequest = 'datasetUploadRequest', // 有人提交了数据集上传请求
  datasetUploadedConfirmRequest = 'datasetUploadedConfirmRequest', // 确认上传完毕
  ossDownloadResult = 'ossDownloadResult', // oss 下载结果
  xTopicReport = 'xTopicReport', // 看板的举报功能
  xTopicPost = 'xTopicPost', // 发帖提示
}

export interface ImportantInfo {
  type: ImportantInfoTypes
  moreInfo: string
}

export interface FetalError {
  type: FetalErrorTypes
  moreInfo: string
}

export class Monitor {
  errorCacheSets: Set<string> = new Set()

  debounceTime = 60000 // 60s 发一次

  minInterval = 15000

  maxInterval = 100000 // 100 秒内发生 2 次，同时间隔 15 秒以上两次，认为是有问题

  errorTimeStampMap: Map<string, number> = new Map()

  reportV2AxiosError(axiosError: AxiosError) {
    if (!(axiosError instanceof AxiosError)) return
    logger.info('[reportV2AxiosError], code:', axiosError.code)

    let payload: FetionReportAxiosPayload | null = null

    if (axiosError.code === AxiosError.ETIMEDOUT || axiosError.code === AxiosError.ECONNABORTED) {
      payload = {
        method: axiosError.config?.method || 'post',
        url: axiosError.config?.url || 'unknown_timeout_url',
        response_time: axiosError.config?.timeout || 10 * 1000,
        params: axiosError.config?.params,
      }
    } else if (axiosError.code === AxiosError.ERR_BAD_RESPONSE) {
      // ERR_BAD_RESPONSE 意味着 50X
      payload = {
        method: axiosError.config?.method || 'post',
        url: axiosError.config?.url || 'unknown_bad_request_url',
        status_code: axiosError.response?.status || 509, // 这里构造一个不存在的 509 的错误码
        params: axiosError.config?.params,
      }
    } else {
      // 这里遗留一个小问题，getaddrinfo EAI_AGAIN 的时候 code 是啥呢
      if (axiosError.response && axiosError.response.status && axiosError.response.status < 500) {
        return
      }
      logger.info(`handle special axios error: ${axiosError.message}, code: ${axiosError.code}`)
      payload = {
        method: axiosError.config?.method || 'post',
        url: axiosError.config?.url || 'unknown_bad_request_url',
        error_message: axiosError.message || '', // 比如：getaddrinfo EAI_AGAIN
        params: axiosError.config?.params,
      }
    }

    if (!payload) return

    if (payload) {
      this.reportV2PureAxiosError(payload)
    }
  }

  reportV2PureAxiosError(payload: FetionReportAxiosPayload) {
    logger.info('[reportV2PureAxiosError]', payload)
    if (!GlobalConfig.ENABLE_FETION_REPORT) {
      logger.info('skip because ENABLE_FETION_REPORT false')
      return
    }

    if (!isLocalDebug())
      axios.post(`${GlobalConfig.BFF_URL}/agg_fetion/report/axios`, {
        payload,
      })
  }

  // 宣传组
  reportV2Public(
    reportInfo: Pick<FetionReportInfo, 'content'> & {
      keyword: ImportantInfoTypes
      assign?: string
    },
  ) {
    logger.info(`[reportV2Public] ${reportInfo.content}`)
    if (!GlobalConfig.ENABLE_FETION_REPORT) {
      logger.info('skip because ENABLE_FETION_REPORT false')
      return
    }

    if (!isLocalDebug())
      axios.post(`${GlobalConfig.BFF_URL}/agg_fetion/report/bff_notice`, {
        payload: {
          content: reportInfo.content,
          assign: reportInfo.assign,
        } as FetionReportBFFNoticePayload,
      })
  }

  // BFF 一般报错
  reportV2BFFTextError(
    reportInfo: Pick<FetionReportInfo, 'content'> & { keyword: FetalErrorTypes; assign?: string },
  ) {
    logger.info(`[reportV2BFFTextError] ${reportInfo.content}`)
    if (!GlobalConfig.ENABLE_FETION_REPORT) {
      logger.info('skip because ENABLE_FETION_REPORT false')
      return
    }

    if (!isLocalDebug())
      axios.post(`${GlobalConfig.BFF_URL}/agg_fetion/report/bff_error`, {
        payload: {
          content: reportInfo.content,
          keyword: reportInfo.keyword,
          assign: reportInfo.assign,
        } as FetionReportBFFErrorPayload,
      })
  }

  // 长链接报错，只有长链接报错需要区分严重与否
  reportV2SocketRequestError(reportInfo: FetionReportInfo) {
    const str = reportInfo.keyword

    if (str === 'unknown_url') {
      logger.error('reportV2SocketRequestError but get unknown_url', reportInfo.content)
      return false
    }

    // 判断这次错误是否是短时间内的第二次了：
    const lastTimeStamp = this.errorTimeStampMap.get(str)
    const currentTimeStamp = getUTC8TimeStamp()

    if (!lastTimeStamp) {
      this.errorTimeStampMap.set(str, currentTimeStamp)
      return false
    }
    if (currentTimeStamp - lastTimeStamp < this.minInterval) {
      return false
    }
    if (currentTimeStamp - lastTimeStamp > this.maxInterval) {
      this.errorTimeStampMap.set(str, currentTimeStamp)
      return false
    }

    this.errorTimeStampMap.set(str, currentTimeStamp)
    return true
  }
}

export const serverMonitor = new Monitor()

// serverMonitor.reportFatalError({
//     type: FetalErrorTypes.ioFrontierError,
//     moreInfo: "redisError"
// })

// let ret1 = serverMonitor.reportFatalError({
//     type: FetalErrorTypes.ioFrontierError,
//     moreInfo: "redisError"
// })

// console.log(`ret1: ${ret1}`);

// setTimeout(() => {
//     let ret2 = serverMonitor.reportFatalError({
//         type: FetalErrorTypes.ioFrontierError,
//         moreInfo: "redisError"
//     })
//     console.log(`ret2: ${ret2}`);
// }, 60100)
