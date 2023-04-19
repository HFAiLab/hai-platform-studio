import type { XTopicNotificationType } from '@hai-platform/shared'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import type { Sequelize } from 'sequelize'
import {
  XTopicNotificationTemplate,
  XTopicNotificationTemplateInit,
} from '../../models/xtopic/NotificationTemplate'

const ContentCache = new Map<
  string,
  { timestamp: number; item: XTopicNotificationTemplate | null }
>()
const getCacheKey = (type: XTopicNotificationType, aggregate: boolean) => `${type}|${aggregate}`
const CACHE_EXPIRES = ONEMINUTE * 3

export class XTopicNotificationTemplateController {
  constructor(sequelize: Sequelize) {
    XTopicNotificationTemplateInit(sequelize)
  }

  async getContent(type: XTopicNotificationType, aggregate: boolean) {
    const cacheKey = getCacheKey(type, aggregate)
    let cached = ContentCache.get(cacheKey)
    if (!cached || new Date().valueOf() - cached.timestamp > CACHE_EXPIRES) {
      const item = await XTopicNotificationTemplate.findOne({
        attributes: ['content'],
        where: {
          type,
          aggregate,
        },
      })
      cached = { item, timestamp: new Date().valueOf() }
      ContentCache.set(cacheKey, cached)
    }
    return cached.item?.content
  }
}
