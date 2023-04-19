import type {
  XTopicNotificationTriggerInsertBody,
  XTopicNotificationTriggerListParams,
  XTopicNotificationTriggerSendedParams,
  XTopicNotificationTriggerUpdateBody,
} from '@hai-platform/client-ailab-server'
import {} from '@hai-platform/shared'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { GlobalNotificationTriggerManager } from '../../biz/xtopic/triggerNotification'
import { HFSequelize } from '../../orm'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const isAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const { page, pageSize } = ctx.request.query as XTopicNotificationTriggerListParams
    // 通过 query 位置传 boolean
    const onlyNotExpired = (ctx.request.query.onlyNotExpired as string) === 'true'
    const hfSequelize = await HFSequelize.getInstance()
    const list = await hfSequelize.xTopicNotificationTrigger.list(
      {
        onlyNotExpired,
        page,
        pageSize,
      },
      {},
    )
    fillResponse(ctx, true, list)
    await next()
  })

  router.post('/insert', async (ctx, next) => {
    const isAdmin = await isXTopicAdmin(ctx.request.headers.token as string)
    const userItem = await getUserInfo(ctx.request.headers.token as string)

    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const option = ctx.request.body as XTopicNotificationTriggerInsertBody
    GlobalNotificationTriggerManager.addTrigger({
      ...option,
      addBy: userItem!.user_name,
      enabled: true,
    })
    fillResponse(ctx, true, null)
    await next()
  })

  router.post('/update', async (ctx, next) => {
    const isAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const option = ctx.request.body as XTopicNotificationTriggerUpdateBody
    await GlobalNotificationTriggerManager.updateTrigger(option)
    fillResponse(ctx, true, null)
    await next()
  })

  router.post('/show_sended', async (ctx, next) => {
    const isAdmin = await isXTopicAdmin(ctx.request.headers.token as string)

    if (!isAdmin) {
      fillResponse(ctx, false, null, 'No permission to access.')
      return
    }
    const option = ctx.request.query as unknown as XTopicNotificationTriggerSendedParams
    const id = option.triggerId
    const sended = await GlobalNotificationTriggerManager.getTriggeredNotifications(id, {
      pageIndex: 0,
      pageSize: 500,
    })
    fillResponse(ctx, true, sended)
    await next()
  })
}

export default register
