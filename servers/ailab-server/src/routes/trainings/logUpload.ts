import type {
  InsertDetailParams,
  QueryShouldUploadParams,
  UpdateRequestStatusParams,
  UserInsertDetailParams,
} from '@hai-platform/shared'
import { LogUploadSource, LogUploadStatus } from '@hai-platform/shared'
import { ONEDAY } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import fs from 'fs-extra'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type {
  LogUploadDetailAttributes,
  LogUploadRequestAttributes,
} from '../../orm/models/LogUpload'
import { generateRid, writeLog } from '../../utils/log'

function register(router: Router) {
  // 写入一条具体的 log，原则上有 rid 就可以写入
  router.post('/insert_detail', async (ctx, next) => {
    const insertParams = ctx.request.body.data as InsertDetailParams
    const distPath = await writeLog(insertParams.rid, insertParams.data)
    logger.info(
      `upload-log insert_detail fingerprint:${insertParams.fingerprint} rid: ${insertParams.rid}`,
    )
    await fs.writeFile(distPath, insertParams.data)
    const insertData: LogUploadDetailAttributes = {
      rid: insertParams.rid,
      fingerprint: insertParams.fingerprint,
      distpath: distPath,
    }
    const hfSequelize = await HFSequelize.getInstance()
    await hfSequelize.LogUploadRequest.insertLogUploadDetail(insertData)
    await hfSequelize.LogUploadRequest.updateLogRequest(insertData.rid, LogUploadStatus.finished)
    fillResponse(ctx, true, null)
    await next()
  })

  // 用户自己主动上传
  router.post('/user_insert_detail', async (ctx, next) => {
    const userParams = ctx.request.body.data as UserInsertDetailParams
    const hfSequelize = await HFSequelize.getInstance()
    logger.info(
      `upload-log user_insert_detail fingerprint:${userParams.fingerprint} rid: ${userParams.uid}`,
    )
    const rid = generateRid(userParams.uid)
    const logUploadRequest: LogUploadRequestAttributes = {
      channel: userParams.channel,
      rid,
      uid: userParams.uid,
      status: LogUploadStatus.finished,
      source: LogUploadSource.user,
    }

    const distPath = await writeLog(rid, userParams.data)
    const logUploadDetail: LogUploadDetailAttributes = {
      rid,
      fingerprint: userParams.fingerprint,
      distpath: distPath,
    }

    // 有依赖关系，串行执行：
    await hfSequelize.LogUploadRequest.insertLogUploadRequest(logUploadRequest)
    await hfSequelize.LogUploadRequest.insertLogUploadDetail(logUploadDetail)

    fillResponse(ctx, true, null)
    await next()
  })

  // 修改一个 log request 的状态
  router.post('/update_request_status', async (ctx, next) => {
    const updateParams = ctx.request.body.data as UpdateRequestStatusParams
    const hfSequelize = await HFSequelize.getInstance()
    hfSequelize.LogUploadRequest.updateLogRequest(updateParams.rid, updateParams.status)
    await next()
  })

  router.post('/query_should_upload', async (ctx, next) => {
    const queryParams = (ctx.request.body.data || ctx.request.body) as QueryShouldUploadParams
    const hfSequelize = await HFSequelize.getInstance()
    const latestData = await hfSequelize.LogUploadRequest.getLatestLogQueryByUid(
      queryParams.channel,
      queryParams.uid,
    )

    if (!latestData) {
      fillResponse(ctx, true, {
        shouldUpload: false,
        lastRid: null,
      })
    } else {
      const latestTime = new Date(latestData.get('createdAt'))

      if (Date.now() - latestTime.valueOf() > 7 * ONEDAY) {
        fillResponse(ctx, true, {
          shouldUpload: false,
          lastRid: null,
        })
        return
      }
      // hint: 为什么 finished 之后也可能返回 true 呢，是因为用户可能有多个浏览器
      let shouldUpload = false
      if (latestData.get('status') !== LogUploadStatus.finished) {
        shouldUpload = true
      } else {
        const lists = await hfSequelize.LogUploadRequest.getDetailListByRid(latestData.get('rid'))
        const ifFingerPrintFound = lists
          .map((item) => item.fingerprint)
          .includes(queryParams.fingerprint)
        shouldUpload = !ifFingerPrintFound
      }
      fillResponse(ctx, true, {
        shouldUpload,
        lastRid: latestData.get('rid'),
      })
    }
    await next()
  })
}

export default register
