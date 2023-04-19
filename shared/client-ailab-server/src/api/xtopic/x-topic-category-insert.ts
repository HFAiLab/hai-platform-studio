import type { XTopicCategorySchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 插入类目最新版本请求参数：
 */
export type XTopicCategoryInsertParams = AilabServerParams

/**
 * 插入类目最新版本请求参数（写到 body 里面）
 */
export type XTopicCategoryInsertBody = Optional<
  Pick<XTopicCategorySchema, 'name' | 'description' | 'order'>,
  'order'
>

/*
 * 插入类目主要响应内容：
 */
export interface XTopicCategoryInsertResult {
  basicItem: XTopicCategorySchema
}

export type XTopicCategoryInsertConfig = AilabServerApiConfig<
  XTopicCategoryInsertParams,
  XTopicCategoryInsertResult,
  XTopicCategoryInsertBody
>
