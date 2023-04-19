import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 修改外部用户中文名的请求参数
 */
export interface ChangeExternalUserNicknameParams extends ApiServerParams {
  user_name: string
  token: string
  nickname: string
}

/**
 * 修改外部用户中文名的响应内容
 */
export interface ChangeExternalUserNicknameResult {
  msg?: string
}

export type ChangeExternalUserNicknameConfig = ApiServerApiConfig<
  ChangeExternalUserNicknameParams,
  ChangeExternalUserNicknameResult
>
