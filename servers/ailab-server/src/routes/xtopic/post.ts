import type {
  XTopicPostDeleteBody,
  XTopicPostDetailParams,
  XTopicPostInsertBody,
  XTopicPostListParams,
  XTopicPostSuggestListParams,
  XTopicPostVisitBody,
} from '@hai-platform/client-ailab-server'
import { AdminGroup, NotificationTriggerEvent, XTopicNotificationType } from '@hai-platform/shared'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { meiliSearchDeleteXTopicPost, meiliSearchSyncXTopicPost } from '../../biz/meilisearch/sync'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { GlobalHeatManager } from '../../biz/xtopic/heat'
import { GlobalNotificationManager } from '../../biz/xtopic/notification'
import { GlobalNotificationTriggerManager } from '../../biz/xtopic/triggerNotification'
import { ImportantInfoTypes, serverMonitor } from '../../monitor'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const options = ctx.request.query as unknown as XTopicPostListParams
    const userInfo = await getUserInfo(ctx.request.headers.token as string)

    const hfSequelize = await HFSequelize.getInstance()
    const countAndRows = await hfSequelize.XTopicPosts.getXTopicPostsList(options, {
      requestUserName: userInfo?.user_name,
      keepAuthor: userInfo?.user_group.includes(AdminGroup.XTOPIC_ADMIN),
    })

    // 调用消息触发器
    if (userInfo) {
      await GlobalNotificationTriggerManager.trigger({
        userItem: userInfo,
        event: NotificationTriggerEvent.REQUEST_LIST,
      })
    }
    fillResponse(ctx, true, countAndRows)
    await next()
  })

  router.post('/suggest_list', async (ctx, next) => {
    const options = ctx.request.query as unknown as XTopicPostSuggestListParams
    const hfSequelize = await HFSequelize.getInstance()
    const suggestions = await hfSequelize.XTopicPosts.getSuggestList(options)
    fillResponse(ctx, true, { suggestions })
    await next()
  })

  router.post('/detail', async (ctx, next) => {
    const options = ctx.request.query as unknown as XTopicPostDetailParams
    const hfSequelize = await HFSequelize.getInstance()
    const userInfo = await getUserInfo(ctx.request.headers.token as string)

    const item = await hfSequelize.XTopicPosts.getXTopicPostsDetail(Number(options.index), {
      requestUserName: userInfo?.user_name,
      keepAuthor: userInfo?.user_group.includes(AdminGroup.XTOPIC_ADMIN),
    })
    fillResponse(ctx, true, item)
    await next()
  })

  router.post('/visit', async (ctx, next) => {
    const options = ctx.request.body as unknown as XTopicPostVisitBody
    const hfSequelize = await HFSequelize.getInstance()
    const item = await hfSequelize.XTopicPosts.addPV(options.postIndex)
    GlobalHeatManager.updateHeat(options.postIndex)

    fillResponse(ctx, true, item)
    await next()
  })

  // STEP1
  router.post('/insert', async (ctx, next) => {
    const option = ctx.request.body as XTopicPostInsertBody
    const hfSequelize = await HFSequelize.getInstance()
    const item = await hfSequelize.XTopicPosts.insert(option)
    serverMonitor.reportV2Public({
      keyword: ImportantInfoTypes.xTopicPost,
      content: `[看板] 用户 ${option.author} 发布了新话题 "${option.title}"，请留意`,
    })
    fillResponse(ctx, true, item)
    meiliSearchSyncXTopicPost()
    await next()
  })

  // STEP1
  // router.post('/update', async (ctx, next) => {})

  // router.post('/update_visible', async (ctx, next) => {})

  // router.post('/update_top', async (ctx, next) => {})

  // router.post('/update_reply', async (ctx, next) => {})

  router.post('/delete', async (ctx, next) => {
    const options = ctx.request.body as XTopicPostDeleteBody
    const hfSequelize = await HFSequelize.getInstance()
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    const isTopicAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    logger.info('options.postIndex):', options.postIndex)

    const item = await hfSequelize.XTopicPosts.getXTopicPostsDetail(Number(options.postIndex), {
      requestUserName: userInfo?.user_name,
      withReplies: true,
    })

    if (!item) {
      fillResponse(ctx, false, null, '没有找到对应的话题')
      return
    }

    if ((item.isSelfPost && item.replyIdList.length === 0) || isTopicAdmin) {
      const deletedPost = await hfSequelize.XTopicPosts.delete(options.postIndex)
      GlobalNotificationManager.notifyPost(options.postIndex, XTopicNotificationType.POST_DELETED)
      if (deletedPost) {
        meiliSearchDeleteXTopicPost(deletedPost)
      }
    } else {
      fillResponse(ctx, false, null, '不符合删除的条件')
      return
    }

    fillResponse(ctx, true, null)
    await next()
  })
}

export default register
