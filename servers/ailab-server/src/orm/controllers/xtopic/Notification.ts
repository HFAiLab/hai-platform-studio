import type {
  XTopicNotificationInsertSchema,
  XTopicNotificationListParams,
} from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { logger } from '../../../base/logger'
import { XTopicNotification, XTopicNotificationInit } from '../../models/xtopic/Notification'

export class XTopicNotificationController {
  constructor(sequelize: Sequelize) {
    XTopicNotificationInit(sequelize)
  }

  countNotification(query: any, unread = true) {
    if (unread) {
      return XTopicNotification.count({
        where: { ...query, read: false },
      })
    }
    return XTopicNotification.count({
      where: query,
    })
  }

  async list(option: XTopicNotificationListParams, query: any) {
    const { page, pageSize } = option
    const itemList = await XTopicNotification.findAll({
      where: query,
      order: [['lastUpdatedAt', 'desc']],
      limit: pageSize,
      offset: page && pageSize ? page * pageSize : 0,
      raw: true,
    })
    return itemList
  }

  async insert(option: XTopicNotificationInsertSchema) {
    logger.info(`notification[${option.type}] added to ${option.notifier}`)
    // @ts-expect-error because 暂时宽松处理
    const basicItem = XTopicNotification.build({
      ...option,
      read: false,
      trash: false,
      lastUpdatedAt: new Date(),
    })
    await basicItem.save()
    return basicItem
  }

  async read(notifier: string, indexes?: number[]) {
    if (!indexes) {
      logger.warn(`[XTOPIC] read all notifications: ${notifier}`)
      const result = await XTopicNotification.update(
        { read: true, notifier },
        { where: { notifier, trash: false } },
      )
      return result
    }
    logger.warn(`[XTOPIC] batch read notification: ${indexes}`)
    const result = await XTopicNotification.update(
      { read: true, notifier },
      { where: { index: indexes } }, // shorthand for Op.in
    )
    return result
  }

  async delete(notifier: string, index: number) {
    if (Number.isNaN(Number(index))) return null

    logger.warn(`[XTOPIC] delete notification: ${index}`)
    const result = await XTopicNotification.update(
      { read: true, trash: true, notifier },
      { where: { index } },
    )
    return result
  }

  async find(option: Partial<XTopicNotification>) {
    const result = await XTopicNotification.findOne({
      where: { ...option, trash: false },
      order: [['createdAt', 'DESC']],
    })
    return result
  }

  async update(index: number, option: Partial<XTopicNotification>) {
    const result = await XTopicNotification.update(option, { where: { index } })
    return result
  }
}
