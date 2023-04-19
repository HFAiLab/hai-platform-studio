import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import type { InsertRequestParams, QueryListParams } from '@hai-platform/shared'
import { LogUploadSource, LogUploadStatus } from '@hai-platform/shared'
import type Router from 'koa-router'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { LogUploadRequestAttributes } from '../../orm/models/LogUpload'
import { MaxDuration, generateRid } from '../../utils/log'

function register(router: Router) {
  // 发一个写 log 的请求
  router.post('/insert_request', async (ctx, next) => {
    const requestParams = ctx.request.body.data as InsertRequestParams

    const rid = generateRid(requestParams.uid)

    logger.info(`log-upload insert_request`, requestParams)

    const requestData: LogUploadRequestAttributes = {
      channel: requestParams.channel,
      rid,
      uid: requestParams.uid,
      status: LogUploadStatus.pending,
      source: LogUploadSource.invoke,
    }

    const hfSequelize = await HFSequelize.getInstance()
    // step1: 查看某个人在某个 channel 是否回捞过
    const lastInvoke = (await hfSequelize.LogUploadRequest.getLatestLogQueryByUid(
      requestData.channel,
      requestData.uid,
    )) as LogUploadRequestAttributes | null

    const shouldSkipThisInsert =
      lastInvoke &&
      (lastInvoke.status !== LogUploadStatus.finished ||
        (lastInvoke.status === LogUploadStatus.finished &&
          lastInvoke.createdAt &&
          getUTC8TimeStamp() - lastInvoke.createdAt.getTime() < MaxDuration))

    if (shouldSkipThisInsert) {
      ctx.body = {
        ret: 1,
        msg: 'LimitFrequency',
      }
    } else {
      await hfSequelize.LogUploadRequest.insertLogUploadRequest(requestData)
      ctx.body = {
        ret: 0,
      }
    }

    await next()
  })

  interface CancelRequestStatusParams {
    rid: string
  }

  router.post('/cancel_request', async (ctx, next) => {
    const updateParams = ctx.request.body.data as CancelRequestStatusParams
    const hfSequelize = await HFSequelize.getInstance()
    hfSequelize.LogUploadRequest.updateLogRequest(updateParams.rid, LogUploadStatus.canceled)
    await next()
  })

  router.post('/list', async (ctx, next) => {
    const listParams = ctx.request.body.data as QueryListParams

    const hfSequelize = await HFSequelize.getInstance()
    const res = await hfSequelize.LogUploadRequest.getLogUploadList(
      listParams.pageSize,
      listParams.offset,
      listParams.channel,
    )

    ctx.body = res
    await next()
  })

  router.post('/demo', async (ctx, next) => {
    ctx.body = 'demo'
    await next()
  })
}

export default register
