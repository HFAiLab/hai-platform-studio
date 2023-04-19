import type { BlogPostMetaInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取要同步的博客 的接口参数
 */
export type XTopicBlogQueryListParams = AilabServerParams

export interface XTopicBlogQueryListResult {
  blogPostMetaList: BlogPostMetaInfo[]
}

export type XTopicBlogQueryListConfig = AilabServerApiConfig<
  XTopicBlogQueryListParams,
  XTopicBlogQueryListResult
>
