import type { AccessTokenFullInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 创建 access token 请求
 */
export type CreateAccessTokenParams = ApiServerParams &
  Pick<AccessTokenFullInfo, 'from_user_name' | 'access_user_name' | 'access_scope'> & {
    expire_at?: string
  }

/*
 * 创建 access token 响应
 */
export type CreateAccessTokenResult = Pick<
  AccessTokenFullInfo,
  'access_token' | 'from_user_name' | 'access_user_name' | 'access_scope' | 'expire_at'
>

export type CreateAccessTokenConfig = ApiServerApiConfig<
  CreateAccessTokenParams,
  CreateAccessTokenResult
>
