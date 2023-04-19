import type {
  XTopicNotificationDeleteBody,
  XTopicNotificationListParams,
  XTopicNotificationListResult,
  XTopicNotificationMassSendingHistoryListParams,
  XTopicNotificationMassSendingHistoryListResult,
  XTopicNotificationSendMassBody,
  XTopicNotificationSendMassResult,
  XTopicNotificationUnreadResult,
} from '@hai-platform/client-ailab-server'
import { NotificationItemCategory, XTopicNotificationType } from '@hai-platform/shared'
import type Router from 'koa-router'
import { Op } from 'sequelize'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { GlobalNotificationManager } from '../../biz/xtopic/notification'
import { GlobalNotificationMassSendingManager } from '../../biz/xtopic/sendMassNotification'
import { GlobalXTopicUserInfoManager } from '../../biz/xtopic/userInfo'
import { HFSequelize } from '../../orm'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function register(router: Router) {
  router.post('/unread', async (ctx, next) => {
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }
    const hfSequelize = await HFSequelize.getInstance()
    const unread = await hfSequelize.xTopicNotification.countNotification({
      notifier: userInfo.user_name,
      trash: false,
    })
    fillResponse(ctx, true, { unread } as XTopicNotificationUnreadResult)
    await next()
  })

  router.post('/list', async (ctx, next) => {
    const options = ctx.request.query as unknown as XTopicNotificationListParams
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    const query = { notifier: userInfo.user_name, trash: false } as any
    if (options.category) {
      // 带筛选器
      const like_types = [XTopicNotificationType.POST_LIKED, XTopicNotificationType.REPLY_LIKED]
      const reply_types = [XTopicNotificationType.REPLY_NEW, XTopicNotificationType.REPLY_REFERRED]
      switch (options.category) {
        case NotificationItemCategory.LIKE_NOTIFICATION:
          query.type = { [Op.in]: like_types }
          break
        case NotificationItemCategory.REPLY_NOTIFICATION:
          query.type = { [Op.in]: reply_types }
          break
        case NotificationItemCategory.SYSTEM_NOTIFICATION:
          query.type = { [Op.notIn]: [...like_types, ...reply_types] }
          break
        default:
          break
      }
    }
    if (options.onlyUnread) query.read = false
    const rows = await hfSequelize.xTopicNotification.list(options, query)
    await GlobalXTopicUserInfoManager.syncFromDB()
    const results = await Promise.all(
      rows.map((row) => GlobalNotificationManager.renderNotification(row)),
    )
    const count = await hfSequelize.xTopicNotification.countNotification(query, false)
    const unreadCount = await hfSequelize.xTopicNotification.countNotification(query)
    if (unreadCount > 0) {
      hfSequelize.xTopicNotification.read(userInfo.user_name) // read all
    }
    fillResponse(ctx, true, { rows: results, count } as XTopicNotificationListResult)
    await next()
  })

  // hint: 目前 list 的时候就直接已读了，所以就先用不到 read，接口暂时留着
  // router.post('/read', async (ctx, next) => {
  //   const { notificationIDs } = ctx.request.body as XTopicNotificationReadBody
  //   const userInfo = await getUserInfo(ctx.request.headers.token as string)
  //   if (!userInfo) {
  //     fillResponse(ctx, false, null, 'user not found')
  //     return
  //   }

  //   const hfSequelize = await HFSequelize.getInstance()
  //   await hfSequelize.xTopicNotification.read(userInfo.user_name, notificationIDs)
  //   fillResponse(ctx, true, true)
  //   await next()
  // })

  router.post('/delete', async (ctx, next) => {
    const { notificationID } = ctx.request.body as XTopicNotificationDeleteBody
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    await hfSequelize.xTopicNotification.delete(userInfo.user_name, notificationID)
    fillResponse(ctx, true, true)
    await next()
  })

  // 群发消息
  router.post('/send_mass', async (ctx, next) => {
    const isAdmin = isXTopicAdmin((ctx.request.headers.token as string) ?? '')
    const userItem = await getUserInfo(ctx.request.header.token as string)
    const { content, onlyInitializedUser, receiver } = ctx.request
      .body as XTopicNotificationSendMassBody

    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const count = await GlobalNotificationMassSendingManager.sendMass({
      content,
      onlyInitializedUser,
      receiver,
      sender: userItem!.user_name,
      notes: onlyInitializedUser ? 'onlyInitialized' : null,
    })
    fillResponse(ctx, true, { messageCount: count } as XTopicNotificationSendMassResult)
    await next()
  })

  // 群发消息历史
  router.post('/mass_sending_history', async (ctx, next) => {
    const isAdmin = isXTopicAdmin((ctx.request.headers.token as string) ?? '')
    const { page, pageSize } = ctx.request.query as XTopicNotificationMassSendingHistoryListParams
    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const history = await GlobalNotificationMassSendingManager.getMassSendingHistory({
      page: page ?? 0,
      pageSize: pageSize ?? 100,
    })

    fillResponse(ctx, true, history as XTopicNotificationMassSendingHistoryListResult)
    await next()
  })
}

export default register
