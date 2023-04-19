import type { XTopicPostSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取推荐话题的 的接口参数
 */
export interface XTopicPostSuggestListParams extends AilabServerParams {
  // 搜索关键字
  keyword_pattern: string | undefined
}

export interface XTopicPostSuggestListResult {
  count: number

  suggestions: Pick<XTopicPostSchema, 'index' | 'title'>[]
}

export type XTopicPostSuggestListConfig = AilabServerApiConfig<
  XTopicPostSuggestListParams,
  XTopicPostSuggestListResult
>
