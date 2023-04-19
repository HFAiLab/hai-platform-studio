import type { XTopicNotificationTriggerSchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicNotificationTriggerInsertParams = AilabServerParams

export type XTopicNotificationTriggerInsertSchema = Optional<
  Pick<
    XTopicNotificationTriggerSchema,
    'content' | 'addBy' | 'enabled' | 'expires' | 'receiver' | 'triggerEvent' | 'triggerMultiple'
  >
>

export type XTopicNotificationTriggerInsertBody = Pick<
  XTopicNotificationTriggerSchema,
  'content' | 'receiver' | 'expires' | 'triggerEvent' | 'triggerMultiple'
>

export type XTopicNotificationTriggerInsertResult = null

export type XTopicNotificationTriggerInsertConfig = AilabServerApiConfig<
  XTopicNotificationTriggerInsertParams,
  XTopicNotificationTriggerInsertResult,
  XTopicNotificationTriggerInsertBody
>
