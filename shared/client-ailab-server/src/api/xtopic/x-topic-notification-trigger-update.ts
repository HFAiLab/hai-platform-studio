import type { XTopicNotificationTriggerSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 更新 trigger 参数：
 */
export type XTopicNotificationTriggerUpdateParams = AilabServerParams

/**
 * 更新 trigger(body 内)
 */
export type XTopicNotificationTriggerUpdateBody = {
  type: 'update' | 'delete'
  index: number
  option?: Pick<XTopicNotificationTriggerSchema, 'enabled' | 'expires'>
}

/*
 * 更新话题用户信息主要响应内容：
 */
export type XTopicNotificationTriggerUpdateResult = null

export type XTopicNotificationTriggerUpdateConfig = AilabServerApiConfig<
  XTopicNotificationTriggerUpdateParams,
  XTopicNotificationTriggerUpdateResult,
  XTopicNotificationTriggerUpdateBody
>
