import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取置顶标签 的接口参数
 */
export interface XTopicTopTagListParams extends AilabServerParams {
  keyword_pattern?: string | undefined

  // 是否展示所有，不截断
  showAll?: boolean
}

export interface XTopicTagDisplayInfo {
  name: string
  count: number
  pin: boolean
  order?: number
}

/**
 * 获取置顶标签 的接口参数
 */
export interface XTopicTopTagListResult {
  tags: XTopicTagDisplayInfo[]
  more: number
}

export type XTopicTopTagListConfig = AilabServerApiConfig<
  XTopicTopTagListParams,
  XTopicTopTagListResult
>
