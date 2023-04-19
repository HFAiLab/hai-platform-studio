import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * [管理员接口] 禁用 / 恢复用户
 */
export interface SetUserActiveStateParams extends ApiServerParams {
  user_name: string
  active: boolean
}

export interface SetUserActiveStateResult {
  msg?: string
}

export type SetUserActiveStateConfig = ApiServerApiConfig<
  SetUserActiveStateParams,
  SetUserActiveStateResult
>
