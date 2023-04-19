import type { XTopicNotificationSchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicNotificationInsertParams = AilabServerParams

export type XTopicNotificationInsertSchema = Optional<
  Pick<
    XTopicNotificationSchema,
    | 'notifier'
    | 'actor'
    | 'sourceType'
    | 'sourceIndex'
    | 'postIndex'
    | 'aggregateCount'
    | 'type'
    | 'aggregate'
    | 'content'
  >,
  'content' | 'sourceType' | 'sourceIndex' | 'postIndex' | 'aggregateCount'
>

export type XTopicNotificationInsertBody = Pick<XTopicNotificationSchema, 'notifier' | 'content'>

export interface XTopicNotificationInsertResult {
  aggregated: boolean
}

export type XTopicNotificationInsertConfig = AilabServerApiConfig<
  XTopicNotificationInsertParams,
  XTopicNotificationInsertResult,
  XTopicNotificationInsertBody
>
