import type { XTopicCarouselSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取轮播列表 的接口参数
 */
export type XTopicCarouselListParams = AilabServerParams

export interface XTopicCarouselListResult {
  list: XTopicCarouselSchema[]
}

export type XTopicCarouselListConfig = AilabServerApiConfig<
  XTopicCarouselListParams,
  XTopicCarouselListResult
>
