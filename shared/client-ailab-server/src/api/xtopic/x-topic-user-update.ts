import type { XTopicUserSchema } from '@hai-platform/shared'
import type { Optional } from 'utility-types'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 更新话题用户信息最新版本请求参数：
 */
export type XTopicUserUpdateParams = AilabServerParams

/**
 * 更新话题用户信息最新版本请求参数（写到 body 里面）
 */
export type XTopicUserUpdateBody = Optional<
  Pick<XTopicUserSchema, 'nickname' | 'avatar' | 'bio'>,
  'nickname' | 'avatar' | 'bio'
>

/*
 * 更新话题用户信息主要响应内容：
 */
export interface XTopicUserUpdateResult {
  nothing: boolean
}

export type XTopicUserUpdateConfig = AilabServerApiConfig<
  XTopicUserUpdateParams,
  XTopicUserUpdateResult,
  XTopicUserUpdateBody
>
