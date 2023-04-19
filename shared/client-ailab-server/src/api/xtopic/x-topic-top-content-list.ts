import type { XTopicTopContentSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取置顶内容 的接口参数
 */
export type XTopicTopContentListParams = AilabServerParams

export interface XTopicTopContentListResult {
  list: XTopicTopContentSchema[]
}

export type XTopicTopContentListConfig = AilabServerApiConfig<
  XTopicTopContentListParams,
  XTopicTopContentListResult
>
