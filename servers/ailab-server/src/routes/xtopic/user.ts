import type { XTopicUserUpdateBody } from '@hai-platform/client-ailab-server'
import { NotificationTriggerEvent } from '@hai-platform/shared'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { GlobalNotificationTriggerManager } from '../../biz/xtopic/triggerNotification'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/detail', async (ctx, next) => {
    const hfSequelize = await HFSequelize.getInstance()
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }
    const user = await hfSequelize.XTopicUser.get(userInfo.user_name)

    const replies = await hfSequelize.XTopicReply.countReplies(userInfo.user_name)
    const posts = await hfSequelize.XTopicPosts.countPosts(userInfo.user_name)

    const postIndexes = posts.rows.map((row) => row.index)
    const replyIndexes = replies.rows.map((reply) => reply.index)

    const likes = await hfSequelize.XTopicLike.countLikesByPostAndReplies({
      postIndexes,
      replyIndexes,
    })

    const isTopicAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    const result = {
      ...user,
      likes,
      replies: replies.count,
      posts: posts.count,
      isTopicAdmin,
    }
    fillResponse(ctx, true, result)
    await next()
  })

  router.post('/update', async (ctx, next) => {
    const option = ctx.request.body as XTopicUserUpdateBody
    const hfSequelize = await HFSequelize.getInstance()
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }
    try {
      const basicItem = await hfSequelize.XTopicUser.update(userInfo.user_name, option)
      fillResponse(ctx, true, basicItem)
      await next()
    } catch (e) {
      fillResponse(ctx, false, null, `${e}`)
    }
    // 调用消息触发器
    await GlobalNotificationTriggerManager.trigger({
      userItem: userInfo,
      event: NotificationTriggerEvent.USER_UPDATE,
    })
  })
}

export default register
