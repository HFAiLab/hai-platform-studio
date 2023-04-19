import type { XTopicLikeSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 点赞最新版本请求参数：
 */
export type XTopicLikeAddParams = AilabServerParams

/**
 * 点赞最新版本请求参数（写到 body 里面）
 */
export type XTopicLikeAddBody = Pick<
  XTopicLikeSchema,
  'contentType' | 'itemIndex' | 'itemUUID' | 'username' | 'likeCount'
>

/*
 * 点赞主要响应内容：
 */
export type XTopicLikeAddResult = null

export type XTopicLikeAddConfig = AilabServerApiConfig<
  XTopicLikeAddParams,
  XTopicLikeAddResult,
  XTopicLikeAddBody
>
