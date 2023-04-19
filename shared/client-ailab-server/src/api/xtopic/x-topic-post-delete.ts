import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 删除问题的最新版本请求参数：
 */
export type XTopicPostDeleteParams = AilabServerParams

/**
 * 删除问题的最新版本请求参数（写到 body 里面）
 */
export type XTopicPostDeleteBody = {
  postIndex: number
}

/*
 * 删除问题的主要响应内容：
 */
export type XTopicPostDeleteResult = null

export type XTopicPostDeleteConfig = AilabServerApiConfig<
  XTopicPostDeleteParams,
  XTopicPostDeleteResult,
  XTopicPostDeleteBody
>
