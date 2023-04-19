import type { NotificationItemCategory, XTopicNotificationSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface XTopicNotificationListSchema
  extends Omit<XTopicNotificationSchema, 'notifier' | 'actor'> {
  // 模板生成的通知的内容
  content: string
  // meta 信息
  meta: { [field: string]: string }
}

export interface XTopicNotificationListParams extends AilabServerParams {
  // 每页显示数量
  pageSize?: number

  // 查询第几页
  page?: number

  // 前端用的通知分类
  category?: NotificationItemCategory

  // 是否只拿未读的消息
  onlyUnread?: boolean
}

export interface XTopicNotificationListResult {
  count: number

  rows: XTopicNotificationListSchema[]
}

export type XTopicNotificationListConfig = AilabServerApiConfig<
  XTopicNotificationListParams,
  XTopicNotificationListResult
>
