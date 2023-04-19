import type { Context, Next } from 'koa'
import { logger } from '../base/logger'
import { api500Counter } from '../base/metrics'
import { GlobalConfig } from '../config'
import { FetalErrorTypes, serverMonitor } from '../monitor'

// function log(ctx: Context) {
//   if (ctx.url === '/') return
//   if (ctx.url === '/proxy/s') return
//   if (ctx.method === 'OPTIONS') return
//   logger.info(`[${ctx.method}]`, ctx.header.host + ctx.url)
// }

// 可以借鉴 koa-logger
export function HLogger() {
  return async (ctx: Context, next: Next) => {
    // log(ctx) // hint: 目前从来没有根据这个日志检查出什么问题来，暂时先不打了
    try {
      await next()
      // 没有资源的 404，我们不能仅仅通过 body 来处理，因为有些请求确实是不设置 body 的
      // if (!ctx.body) {  // 没有资源
      //   ctx.status = 404;
      //   ctx.body = "[auto detect] not found"
      // }
    } catch (e) {
      ctx.status = 500
      ctx.response.body = {
        success: 0,
        msg: '[auto detect by try catch] internal server error (cluster server or bff)',
      }

      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.autoDetectInternal500,
        assign: GlobalConfig.STUDIO_ERROR_NOTICE_ASSIGN_NAME,
        content: `[auto detect by try catch] internal server error `,
      })

      logger.error('[auto detect] logger get error', e)
      logger.error('[auto detect] logger info', ctx.request.path)
      logger.error(`500 [${ctx.method}]`, ctx.header.host + ctx.url, '\n', e)
      api500Counter.inc(
        {
          path: ctx.request.path,
        },
        1,
      )
    }
  }
}

// 在 pod 里面可以通过 HOSTNAME 来判断
// HOSTNAME-----ailab-server-844889b958-gxrt4
// KUBERNETES_SERVICE_HOST
