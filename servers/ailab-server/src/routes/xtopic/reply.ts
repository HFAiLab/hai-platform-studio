import type {
  XTopicReplyDeleteBody,
  XTopicReplyInsertBody,
  XTopicReplyListParams,
} from '@hai-platform/client-ailab-server'
import { AdminGroup } from '@hai-platform/shared'
import type Router from 'koa-router'
import { Transaction } from 'sequelize'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { meiliSearchSyncXTopicPost } from '../../biz/meilisearch/sync'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { GlobalHeatManager } from '../../biz/xtopic/heat'
import { GlobalNotificationManager } from '../../biz/xtopic/notification'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const options = ctx.request.query as unknown as XTopicReplyListParams
    if (!options.postIndex) {
      fillResponse(ctx, false, null, 'postIndex not found')
      return
    }
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    const hfSequelize = await HFSequelize.getInstance()
    const countAndRows = await hfSequelize.XTopicReply.getXTopicReplyList(options, {
      requestUserName: userInfo?.user_name,
      keepAuthor: userInfo?.user_group.includes(AdminGroup.XTOPIC_ADMIN),
    })
    fillResponse(ctx, true, countAndRows)
    await next()
  })

  router.post('/insert', async (ctx, next) => {
    const option = ctx.request.body as XTopicReplyInsertBody
    const hfSequelize = await HFSequelize.getInstance()
    const begin = Date.now()
    const transaction = await hfSequelize.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    })

    try {
      const replyItem = await hfSequelize.XTopicReply.insert(option, { transaction })
      GlobalHeatManager.updateHeat(option.postIndex)
      await hfSequelize.XTopicPosts.updateRepliedAt(option.postIndex, { transaction })
      GlobalNotificationManager.notifyPostReplied(replyItem) // 通知弱一致性
      await transaction.commit()
      logger.info('[xtopic] reply insert transaction cost:', Date.now() - begin)
      meiliSearchSyncXTopicPost()

      fillResponse(ctx, true, { replyItem })
    } catch (e) {
      logger.error('reply error:', e)
      await transaction.rollback()
      fillResponse(ctx, true, '数据库繁忙，请稍后重试')
      return
    }

    await next()
  })

  router.post('/delete', async (ctx, next) => {
    const options = ctx.request.body as XTopicReplyDeleteBody
    const hfSequelize = await HFSequelize.getInstance()
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    const isTopicAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    const item = await hfSequelize.XTopicReply.getXTopicReplyDetail({
      replyIndex: options.replyIndex,
    })

    if (!item) {
      fillResponse(ctx, false, null, '没有找到对应的话题')
      return
    }

    if ((item.author && item.author === userInfo?.user_name) || isTopicAdmin) {
      await hfSequelize.XTopicReply.delete(options.replyIndex)
      GlobalNotificationManager.notifyReplyDeleted(item)
      meiliSearchSyncXTopicPost() // 更好的做法是更新某一个 Post，不过现在帖子太少了，后面集中做此类优化
    } else {
      fillResponse(ctx, false, null, '不符合删除的条件')
      return
    }

    fillResponse(ctx, true, null)
    // 拿到 post 的信息
    // 判断是否是管理员用户
    await next()
  })

  // router.post('/update', async (ctx, next) => {})
}

export default register
