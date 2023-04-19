import type { XTopicNotificationMassSendingHistorySchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicNotificationMassSendingHistoryListSchema =
  XTopicNotificationMassSendingHistorySchema

export interface XTopicNotificationMassSendingHistoryListParams extends AilabServerParams {
  // 每页显示数量
  pageSize?: number

  // 查询第几页
  page?: number
}

export interface XTopicNotificationMassSendingHistoryListResult {
  count: number
  rows: XTopicNotificationMassSendingHistoryListSchema[]
}

export type XTopicNotificationMassSendingHistoryListConfig = AilabServerApiConfig<
  XTopicNotificationMassSendingHistoryListParams,
  XTopicNotificationMassSendingHistoryListResult
>
