import type {
  XTopicNotificationTriggerInsertSchema,
  XTopicNotificationTriggerListParams,
  XTopicNotificationTriggerUpdateBody,
} from '@hai-platform/client-ailab-server'
import type { NotificationTriggerEvent } from '@hai-platform/shared'
import { NotificationSpecialReceiver, UserRole } from '@hai-platform/shared'
import type { SingleUserInfoWithoutToken } from '@hai-platform/studio-schemas/lib/cjs/isomorph/user/info'
import Op from 'sequelize/lib/operators'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { XTopicNotificationTrigger } from '../../orm/models/xtopic/NotificationTrigger'
import { GlobalNotificationManager } from './notification'

type AddTriggerOption = Required<XTopicNotificationTriggerInsertSchema>

export class NotificationTriggerManager {
  async addTrigger(option: AddTriggerOption) {
    const instance = await HFSequelize.getInstance()
    return instance.xTopicNotificationTrigger.insert({ ...option })
  }

  async updateTrigger(option: XTopicNotificationTriggerUpdateBody) {
    const instance = await HFSequelize.getInstance()
    const { index, type } = option
    if (type === 'delete') {
      return instance.xTopicNotificationTrigger.update(index, {
        deleted: true,
      })
    }

    return instance.xTopicNotificationTrigger.update(index, {
      enabled: option.option?.enabled,
      expires: option.option?.expires,
    })
  }

  async listTriggers(option: XTopicNotificationTriggerListParams) {
    const instance = await HFSequelize.getInstance()
    return instance.xTopicNotificationTrigger.list(
      { pageSize: option.pageSize, page: option.page },
      option.onlyNotExpired ? { expires: { [Op.gt]: new Date() } } : {},
    )
  }

  // 触发检测
  async trigger(option: { userItem: SingleUserInfoWithoutToken; event: NotificationTriggerEvent }) {
    function triggerFilterFunc(trigger: XTopicNotificationTrigger, u: SingleUserInfoWithoutToken) {
      return (
        trigger.receiver === NotificationSpecialReceiver.PUBLIC ||
        (trigger.receiver === NotificationSpecialReceiver.INTERNAL &&
          u.group_list.includes(UserRole.INTERNAL)) ||
        (trigger.receiver === NotificationSpecialReceiver.EXTERNAL &&
          u.group_list.includes(UserRole.EXTERNAL)) ||
        trigger.receiver
          .split(',')
          .map((i) => i.trim())
          .includes(u.user_name)
      )
    }
    const instance = await HFSequelize.getInstance()

    const triggers = (
      await instance.xTopicNotificationTrigger.findByEvent({
        triggerEvent: option.event,
      })
    ).filter((t) => triggerFilterFunc(t, option.userItem))
    for (const trigger of triggers) {
      try {
        // 触发器仅单次触发时，检测是否已经发送过
        if (!trigger.triggerMultiple) {
          const alreadyTriggered = await instance.xTopicNotification.find({
            sourceType: 'custom',
            sourceIndex: trigger.index,
            notifier: option.userItem.user_name,
          })
          if (alreadyTriggered) {
            continue
          }
        }
        await GlobalNotificationManager.notifyCustom(
          option.userItem.user_name,
          trigger.content,
          trigger.index,
        )
        await instance.xTopicNotificationTrigger.incCount(trigger.index)
        logger.info(
          `Notification-Trigger: idx:${trigger.index} event:${option.event} -> ${option.userItem.user_name}`,
        )
      } catch (e) {
        logger.error(
          `Notification-Trigger-Error: idx:${trigger.index} event:${option.event} -> ${option.userItem.user_name}`,
        )
      }
    }
  }

  // 获取触发发出的消息
  async getTriggeredNotifications(
    triggerIndex: number,
    option: {
      pageSize?: number
      pageIndex?: number
    },
  ) {
    const instance = await HFSequelize.getInstance()
    const notifications = await instance.xTopicNotification.list(
      {
        page: option.pageIndex,
        pageSize: option.pageSize,
      },
      { sourceType: 'custom', sourceIndex: triggerIndex },
    )
    const count = await instance.xTopicNotification.countNotification({
      sourceType: 'custom',
      sourceIndex: triggerIndex,
    })
    return { rows: notifications, count }
  }
}

export const GlobalNotificationTriggerManager = new NotificationTriggerManager()
