import type { XTopicNotificationSourceType, XTopicNotificationType } from './common'

export interface XTopicNotificationTemplateSchema {
  // 模板描述
  description: string
  // 通知模板类型
  type: XTopicNotificationType
  // 通知关联的内容类型 (目前可以是帖子/回复/用户/自定义)
  sourceType: XTopicNotificationSourceType
  // 是否聚合字段
  aggregate: boolean
  // 更新时间
  updatedAt: Date
  // 创建时间
  createdAt: Date
  // 通知 HTML 模板
  content: string
}
