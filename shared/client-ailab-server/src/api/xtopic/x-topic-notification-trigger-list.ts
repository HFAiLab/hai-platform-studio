import type { XTopicNotificationTriggerSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface XTopicNotificationTriggerListParams extends AilabServerParams {
  // 每页显示数量
  pageSize?: number

  // 查询第几页
  page?: number

  // 是否只拿未过期的
  onlyNotExpired?: boolean
}

export interface XTopicNotificationTriggerListResult {
  count: number
  rows: XTopicNotificationTriggerSchema[]
}

export type XTopicNotificationTriggerListConfig = AilabServerApiConfig<
  XTopicNotificationTriggerListParams,
  XTopicNotificationTriggerListResult
>
