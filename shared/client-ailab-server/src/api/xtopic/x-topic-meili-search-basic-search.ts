import type { XTopicMeiliSearchResult } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 搜索 的接口参数
 */
export type XTopicMeiliSearchBasicSearchParams = AilabServerParams

export interface XTopicMeiliSearchBasicSearchBody {
  keyword: string

  /**
   * 每页的数量
   */
  pageSize: number

  /**
   * 第多少页
   */
  page: number
}

export type XTopicMeiliSearchBasicSearchResult = XTopicMeiliSearchResult

export type XTopicMeiliSearchBasicSearchConfig = AilabServerApiConfig<
  XTopicMeiliSearchBasicSearchParams,
  XTopicMeiliSearchBasicSearchResult,
  XTopicMeiliSearchBasicSearchBody
>
