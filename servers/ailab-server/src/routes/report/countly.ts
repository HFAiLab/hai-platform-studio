import type Router from 'koa-router'
import { axiosNoCache } from '../../base/axios'
import { logger } from '../../base/logger'

interface CountlyReportInfo {
  url: string
  params: Record<string, number | string>
  headers?: Record<string, string>
}

/**
 *  Convert JSON object to URL encoded query parameter string
 *  @memberof Countly._internals
 *  @param {Object} params - object with query parameters
 *  @returns {String} URL encode query string
 */
function prepareParams(params: Record<string, number | string>) {
  const str = []
  for (const i in params) {
    str.push(`${i}=${encodeURIComponent(`${params[i]}`)}`)
  }
  return str.join('&')
}

function register(router: Router) {
  router.post('/i', async (ctx, next) => {
    const info = ctx.request.body as CountlyReportInfo
    const data = prepareParams(info.params)
    const url = `${info.url}?${data}`
    if (url.length > 8192) {
      logger.info('countly report error: url too long', url)
      ctx.response.body = { result: 'Error' }
      return
    }
    await axiosNoCache.post(
      url,
      {},
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'referer': ctx.request.headers.referer || '',
          'origin': ctx.request.headers.origin || '',
          'user-agent': ctx.request.headers['user-agent'] || '',
          ...(info.headers || {}),
        },
      },
    )

    ctx.response.body = { result: 'Success' }
    await next()
  })
}

export default register
