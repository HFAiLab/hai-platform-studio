import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 设置外部用户激活情况请求参数：
 */
export interface SetExternalUserActiveStateParams extends AilabServerParams {
  user_name: string
  active: boolean
}

/*
 * 设置外部用户激活情况响应内容：
 */
export type SetExternalUserActiveStateResult = null

export type SetExternalUserActiveStateConfig = AilabServerApiConfig<
  SetExternalUserActiveStateParams,
  SetExternalUserActiveStateResult
>
