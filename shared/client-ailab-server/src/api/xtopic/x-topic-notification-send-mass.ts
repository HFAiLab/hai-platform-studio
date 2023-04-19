import type { XTopicNotificationMassSendingHistorySchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicNotificationSendMassSchema = AilabServerParams

export type XTopicNotificationSendMassResult = Pick<
  XTopicNotificationMassSendingHistorySchema,
  'messageCount'
>

export type XTopicNotificationSendMassBody = Pick<
  XTopicNotificationMassSendingHistorySchema,
  'content' | 'receiver'
> & {
  onlyInitializedUser: boolean
}

export type XTopicNotificationSendMassConfig = AilabServerApiConfig<
  XTopicNotificationSendMassSchema,
  XTopicNotificationSendMassResult,
  XTopicNotificationSendMassBody
>
