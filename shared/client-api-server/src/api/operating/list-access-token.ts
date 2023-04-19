import type { AccessTokenFullInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 列出当前所有拥有的 access token 请求参数：
 */
export type ListAccessTokenParams = ApiServerParams

/*
 * 列出当前所有拥有的 access token 主要响应内容：
 */
export interface ListAccessTokenResult {
  access_tokens: AccessTokenFullInfo[]
}

export type ListAccessTokenConfig = ApiServerApiConfig<ListAccessTokenParams, ListAccessTokenResult>
