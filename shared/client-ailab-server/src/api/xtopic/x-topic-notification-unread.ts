import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 通知已读的最新版本请求参数：
 */
export type XTopicNotificationUnreadParams = AilabServerParams

/*
 * 通知已读的主要响应内容：
 */
export interface XTopicNotificationUnreadResult {
  unread: number
}

export type XTopicNotificationUnreadConfig = AilabServerApiConfig<
  XTopicNotificationUnreadParams,
  XTopicNotificationUnreadResult
>
