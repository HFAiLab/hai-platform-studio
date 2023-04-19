import type { XTopicUserSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 获取话题用户信息最新版本请求参数：
 */
export type XTopicUserDetailParams = AilabServerParams

/*
 * 获取话题用户信息主要响应内容：
 */
export type XTopicUserDetailResult = XTopicUserSchema & {
  // 是否是话题管理员
  isTopicAdmin?: boolean

  likes: number | null
  replies: number | null
  posts: number | null
}

export type XTopicUserDetailConfig = AilabServerApiConfig<
  XTopicUserDetailParams,
  XTopicUserDetailResult
>
