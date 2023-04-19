import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 删除 access token 请求参数：
 */
export type DeleteAccessTokenParams = ApiServerParams & {
  access_token: string
}

/*
 * 删除 access token 主要响应内容：
 */
export interface DeleteAccessTokenResult {
  msg?: string
}

export type DeleteAccessTokenConfig = ApiServerApiConfig<
  DeleteAccessTokenParams,
  DeleteAccessTokenResult
>
