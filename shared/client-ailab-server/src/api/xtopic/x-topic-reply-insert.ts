import type { XTopicReplySchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 创建回复的最新版本请求参数：
 */
export type XTopicReplyInsertParams = AilabServerParams

/**
 * 创建回复的最新版本请求参数（写到 body 里面）
 */
export type XTopicReplyInsertBody = Optional<
  Pick<XTopicReplySchema, 'content' | 'author' | 'pin' | 'postIndex' | 'referReplyIndex'>,
  'pin' | 'referReplyIndex'
>

/*
 * 创建回复的主要响应内容：
 */
export interface XTopicReplyInsertResult {
  nothing: boolean
}

export type XTopicReplyInsertConfig = AilabServerApiConfig<
  XTopicReplyInsertParams,
  XTopicReplyInsertResult,
  XTopicReplyInsertBody
>
