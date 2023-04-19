import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 删除通知的最新版本请求参数：
 */
export type XTopicNotificationDeleteParams = AilabServerParams

/**
 * 删除通知的最新版本请求参数（写到 body 里面）
 */
export type XTopicNotificationDeleteBody = {
  notificationID: number
}

/*
 * 删除通知的主要响应内容：
 */
export type XTopicNotificationDeleteResult = null

export type XTopicNotificationDeleteConfig = AilabServerApiConfig<
  XTopicNotificationDeleteParams,
  XTopicNotificationDeleteResult,
  XTopicNotificationDeleteBody
>
