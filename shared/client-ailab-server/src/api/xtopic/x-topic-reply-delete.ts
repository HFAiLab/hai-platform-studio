import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 删除回复的最新版本请求参数：
 */
export type XTopicReplyDeleteParams = AilabServerParams

/**
 * 删除回复的最新版本请求参数（写到 body 里面）
 */
export type XTopicReplyDeleteBody = {
  replyIndex: number
}

/*
 * 删除回复的主要响应内容：
 */
export type XTopicReplyDeleteResult = null

export type XTopicReplyDeleteConfig = AilabServerApiConfig<
  XTopicReplyDeleteParams,
  XTopicReplyDeleteResult,
  XTopicReplyDeleteBody
>
