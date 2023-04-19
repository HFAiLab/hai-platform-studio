import type { XTopicNotificationMassSendingHistoryListParams } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { logger } from '../../../base/logger'
import {
  XTopicNotificationMassSendingHistory,
  XTopicNotificationMassSendingHistoryInit,
} from '../../models/xtopic/NotificationMassSendingHistory'

export class XTopicNotificationMassSendingHistoryController {
  constructor(sequelize: Sequelize) {
    XTopicNotificationMassSendingHistoryInit(sequelize)
  }

  async list(option: XTopicNotificationMassSendingHistoryListParams, query: any) {
    const { page, pageSize } = option
    const where = { ...query }
    const triggers = await XTopicNotificationMassSendingHistory.findAndCountAll({
      where,
      order: [['createdAt', 'desc']],
      limit: pageSize,
      offset: page && pageSize ? page * pageSize : 0,
      raw: true,
    })
    return triggers
  }

  async insert(
    option: Pick<
      XTopicNotificationMassSendingHistory,
      'content' | 'messageCount' | 'sender' | 'receiver'
    > & { notes: string | null },
  ) {
    logger.info(
      `${option.sender} send mass notification (count:${option.messageCount}) to [${option.receiver}] content: [${option.content}]`,
    )

    // @ts-expect-error because 暂时宽松处理
    const logItem = XTopicNotificationMassSendingHistory.build({
      ...option,
    })
    await logItem.save()
  }
}
