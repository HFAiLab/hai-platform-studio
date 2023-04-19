import type { AilabServerApiConfig, AilabServerParams } from '../../types'
/*
 * 查询后端是否有 MeiliSearch 实例，来做话题内容的全文搜索
 */

export type XTopicMeiliSearchAvailableParams = AilabServerParams

export type XTopicMeiliSearchAvailableResult = boolean

export type XTopicMeiliSearchAvailableConfig = AilabServerApiConfig<
  XTopicMeiliSearchAvailableParams,
  XTopicMeiliSearchAvailableResult
>
