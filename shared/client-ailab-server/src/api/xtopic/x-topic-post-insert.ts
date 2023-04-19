import type { ExtendedTask, XTopicPostSchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 创建问题的最新版本请求参数：
 */
export type XTopicPostInsertParams = AilabServerParams

/**
 * 创建问题的最新版本请求参数（写到 body 里面）
 */
export type XTopicPostInsertBody = Optional<
  Pick<
    XTopicPostSchema,
    'title' | 'content' | 'author' | 'category' | 'tags' | 'pin' | 'blogName' | 'createdAt'
  >,
  'pin' | 'blogName' | 'createdAt'
>

/*
 * 创建问题的主要响应内容：
 */
export interface XTopicPostInsertResult {
  task: ExtendedTask
}

export type XTopicPostInsertConfig = AilabServerApiConfig<
  XTopicPostInsertParams,
  XTopicPostInsertResult,
  XTopicPostInsertBody
>
