import type { XTopicNotificationSourceType, XTopicNotificationType } from './common'

export interface XTopicNotificationSchema {
  // 通知 ID
  index: number
  // 被通知的用户名
  notifier: string
  // 通知者的用户名或用户名列表
  actor: string
  // 通知关联的内容类型 (目前可以是帖子/回复/赞)
  sourceType: XTopicNotificationSourceType
  // 通知关联的内容 index
  sourceIndex: number
  // 如果是和帖子关联，填帖子 index
  postIndex: number
  // 通知模板类型
  type: XTopicNotificationType
  // 是否已读
  read: boolean
  // 是否删除
  trash: boolean
  // 是否聚合字段
  aggregate: boolean
  // 如果是聚合字段，填写聚合数目
  aggregateCount: number
  // 用于自定义通知的内容储存
  content: string
  // 最近一次更新的时间：这个是我们真正的更新时间
  lastUpdatedAt: Date
  // 更新时间
  updatedAt: Date
  // 创建时间
  createdAt: Date
}
