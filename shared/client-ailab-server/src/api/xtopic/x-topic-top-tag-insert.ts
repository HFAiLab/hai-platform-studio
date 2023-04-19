import type { XTopicTopTagSchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 创建置顶标签最新版本请求参数：
 */
export type XTopicTopTagInsertParams = AilabServerParams

/**
 * 创建置顶标签最新版本请求参数（写到 body 里面）
 */
export type XTopicTopTagInsertBody = Optional<
  Pick<XTopicTopTagSchema, 'name' | 'description' | 'order'>,
  'order'
>

/*
 * 创建置顶标签主要响应内容：
 */
export interface XTopicTopTagInsertResult {
  basicItem: XTopicTopTagSchema
}

export type XTopicTopTagInsertConfig = AilabServerApiConfig<
  XTopicTopTagInsertParams,
  XTopicTopTagInsertResult,
  XTopicTopTagInsertBody
>
