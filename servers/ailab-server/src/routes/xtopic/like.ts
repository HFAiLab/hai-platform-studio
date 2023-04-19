import type { XTopicLikeAddBody } from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { GlobalHeatManager } from '../../biz/xtopic/heat'
import { GlobalNotificationManager } from '../../biz/xtopic/notification'
import { FetalErrorTypes, serverMonitor } from '../../monitor'
import { HFSequelize } from '../../orm'
import { GlobalPromiseSerialExecuter } from '../../utils/promise'

const createAddLikePromise = async (options: XTopicLikeAddBody, hfSequelize: HFSequelize) => {
  const transaction = await hfSequelize.sequelize.transaction()

  try {
    await hfSequelize.XTopicLike.addLike(options, { transaction })
    if (options.contentType === 'post') {
      await hfSequelize.XTopicPosts.addLike(options.itemIndex, options.likeCount, { transaction })
      // 更新热度不需要等待完成
      GlobalHeatManager.updateHeat(options.itemIndex)
      GlobalNotificationManager.notifyPostLiked(options)
    } else if (options.contentType === 'reply') {
      await hfSequelize.XTopicReply.addLike(options.itemIndex, options.likeCount, { transaction })
      GlobalNotificationManager.notifyReplyLiked(options)
    } else if (options.contentType === 'comment') {
      // do nothing now
    }
    await transaction.commit()
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

function register(router: Router) {
  router.post('/add', async (ctx, next) => {
    const options = ctx.request.body as unknown as XTopicLikeAddBody
    if (options.likeCount && options.likeCount !== 1) {
      fillResponse(ctx, false, null, '点赞数量不为 1，非正常请求，已触发上报')
      const userInfo = await getUserInfo(ctx.request.headers.token as string)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.xTopicLikeSuspectedAttack,
        content: `[XTOPIC] 检测到非正常途径点赞，请求者：${userInfo?.user_name}`,
      })
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    const begin = Date.now()

    try {
      await GlobalPromiseSerialExecuter.execute(
        createAddLikePromise,
        [options, hfSequelize],
        options.itemUUID,
      )
    } catch (e) {
      logger.error('reply error:', e)
      fillResponse(ctx, true, '数据库繁忙，请稍后重试')
    }

    logger.info('like insert cost:', Date.now() - begin)

    fillResponse(ctx, true, null)
    await next()
  })
}

export default register
