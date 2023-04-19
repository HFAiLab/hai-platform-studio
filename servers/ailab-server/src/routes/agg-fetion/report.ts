import type Router from 'koa-router'
import { fillResponse } from '..'
import { parseAndEnqueue } from '../../biz/agg-fetion/helper'
import type {
  FetionReportAxiosPayload,
  FetionReportBFFErrorPayload,
  FetionReportBFFNoticePayload,
  FetionReportClusterPayload,
} from '../../biz/agg-fetion/schema'
import { AggFetionSource } from '../../biz/agg-fetion/schema'

function register(router: Router) {
  /**
   * 集群的 http 请求
   */
  router.post('/cluster', async (ctx, next) => {
    const payload = ctx.request.body.payload as FetionReportClusterPayload
    parseAndEnqueue({
      source: AggFetionSource.cluster,
      payload,
    })
    fillResponse(ctx, true, {
      added: true,
    })
    await next()
  })

  /**
   * bff 的 axios http 请求
   */
  router.post('/axios', async (ctx, next) => {
    const payload = ctx.request.body.payload as FetionReportAxiosPayload
    parseAndEnqueue({
      source: AggFetionSource.axios,
      payload,
    })

    fillResponse(ctx, true, {
      added: true,
    })
    await next()
  })

  router.post('/bff_notice', async (ctx, next) => {
    const payload = ctx.request.body.payload as FetionReportBFFNoticePayload
    parseAndEnqueue({
      source: AggFetionSource.bff_notice,
      payload,
    })
    fillResponse(ctx, true, {
      added: true,
    })
    await next()
  })

  router.post('/bff_error', async (ctx, next) => {
    const payload = ctx.request.body.payload as FetionReportBFFErrorPayload
    parseAndEnqueue({
      source: AggFetionSource.bff_error,
      payload,
    })
    fillResponse(ctx, true, {
      added: true,
    })
    await next()
  })
}

export default register
