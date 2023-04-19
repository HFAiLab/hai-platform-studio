import type {
  XTopicNotificationMassSendingHistoryListParams,
  XTopicNotificationMassSendingHistoryListResult,
  XTopicNotificationSendMassBody,
} from '@hai-platform/client-ailab-server'
import { NotificationSpecialReceiver, UserRole } from '@hai-platform/shared'
import { logger } from '../../base/logger'
import { getAllUsers } from '../../base/users'
import { HFSequelize } from '../../orm'
import { GlobalNotificationManager } from './notification'
import { GlobalXTopicUserInfoManager } from './userInfo'

interface SendMassOption extends XTopicNotificationSendMassBody {
  sender: string
  notes: string | null
}

export class NotificationMassSendingManager {
  async sendMass(option: SendMassOption) {
    let allUsers = await getAllUsers()
    const receiver = option.receiver.trim()
    const xTopicInitializedUsers = await GlobalXTopicUserInfoManager.getAllXtopicUser()

    if (option.onlyInitializedUser) {
      allUsers = allUsers.filter((u) => xTopicInitializedUsers.has(u.user_name))
    }

    let filteredUsers = []
    if (option.receiver === NotificationSpecialReceiver.EXTERNAL) {
      filteredUsers = allUsers.filter((u) => u.role === UserRole.EXTERNAL)
    } else if (option.receiver === NotificationSpecialReceiver.INTERNAL) {
      filteredUsers = allUsers.filter((u) => u.role === UserRole.INTERNAL)
    } else if (option.receiver === NotificationSpecialReceiver.PUBLIC) {
      filteredUsers = allUsers
    } else {
      const specified = new Set(receiver.split(',').map((i: string) => i.trim()))
      filteredUsers = allUsers.filter((u) => specified.has(u.user_name))
    }

    let sendCount = 0
    // 逐条发送
    try {
      for (const user of filteredUsers) {
        GlobalNotificationManager.notifyCustom(user.user_name, option.content)
        sendCount += 1
      }
    } catch (e) {
      logger.error(`群发消息出错：${e}`)
    }
    if (sendCount > 0) {
      const instance = await HFSequelize.getInstance()
      await instance.xTopicNotificationMassSendingHistory.insert({
        content: option.content,
        messageCount: sendCount,
        receiver: option.receiver,
        sender: option.sender,
        notes: option.notes,
      })
    }
    return sendCount
  }

  async getMassSendingHistory(
    option: XTopicNotificationMassSendingHistoryListParams,
  ): Promise<XTopicNotificationMassSendingHistoryListResult> {
    const instance = await HFSequelize.getInstance()
    const logs = await instance.xTopicNotificationMassSendingHistory.list(
      {
        page: option.page ?? 0,
        pageSize: option.pageSize ?? 10000,
      },
      {},
    )
    return logs
  }
}

export const GlobalNotificationMassSendingManager = new NotificationMassSendingManager()
