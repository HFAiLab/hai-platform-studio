import type { XTopicNotificationTriggerListParams } from '@hai-platform/client-ailab-server'
import type { NotificationTriggerEvent } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Op } from 'sequelize'
import { logger } from '../../../base/logger'
import {
  XTopicNotificationTrigger,
  XTopicNotificationTriggerInit,
} from '../../models/xtopic/NotificationTrigger'
import type { CommonSQLOptions } from '../schema'

export class XTopicNotificationTriggerController {
  constructor(sequelize: Sequelize) {
    XTopicNotificationTriggerInit(sequelize)
  }

  async list(option: XTopicNotificationTriggerListParams, query: any) {
    const { page, pageSize, onlyNotExpired } = option
    const where = { ...(query ?? {}), deleted: false }
    if (onlyNotExpired) {
      where.expires = {
        [Op.gt]: new Date(),
      }
    }
    const triggers = await XTopicNotificationTrigger.findAndCountAll({
      where,
      order: [['index', 'desc']],
      limit: pageSize,
      offset: page && pageSize ? page * pageSize : 0,
      raw: true,
    })
    return triggers
  }

  async insert(
    option: Pick<
      XTopicNotificationTrigger,
      'addBy' | 'content' | 'triggerEvent' | 'triggerMultiple' | 'expires' | 'receiver'
    >,
  ) {
    logger.info(`${option.addBy} added notification trigger of event [${option.triggerEvent}]`)

    // @ts-expect-error because 暂时宽松处理
    const trigger = XTopicNotificationTrigger.build({
      ...option,
    })
    await trigger.save()
  }

  async findByEvent(option: { triggerEvent: NotificationTriggerEvent }) {
    const triggers = await XTopicNotificationTrigger.findAll({
      where: {
        expires: {
          [Op.gt]: new Date(),
        },
        enabled: true,
        deleted: false,
        triggerEvent: option.triggerEvent,
      },
      raw: true,
    })
    return triggers
  }

  // 触发计数
  async incCount(index: number, sqlOptions?: CommonSQLOptions) {
    await XTopicNotificationTrigger.increment('triggerCount', {
      where: {
        index,
      },
      transaction: sqlOptions?.transaction,
    })
    return true
  }

  // update
  async update(
    index: number,
    option: Partial<Pick<XTopicNotificationTrigger, 'expires' | 'enabled' | 'deleted'>>,
  ) {
    const trigger = await XTopicNotificationTrigger.findByPk(index)
    trigger?.update(option)
    return trigger
  }
}
