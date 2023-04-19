import type { XTopicNotificationSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicNotificationListTriggerSendedSchema = Pick<
  XTopicNotificationSchema,
  'notifier' | 'createdAt' | 'read'
>

export interface XTopicNotificationTriggerSendedParams extends AilabServerParams {
  triggerId: number
}

export interface XTopicNotificationTriggerSendedResult {
  count: number
  rows: XTopicNotificationListTriggerSendedSchema[]
}

export type XTopicNotificationTriggerSendedConfig = AilabServerApiConfig<
  XTopicNotificationTriggerSendedParams,
  XTopicNotificationTriggerSendedResult
>
