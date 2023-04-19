import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 设置用户配置 的接口参数
 */
export type SetConfigTextParams = AilabServerParams

export interface SetConfigTextBody {
  user_name: string
  config_json: string
}

/**
 * 设置用户配置 的接口返回结果
 */
export type SetConfigTextResult = boolean

/**
 * 设置用户配置 的接口配置
 */
export type SetConfigTextApiConfig = AilabServerApiConfig<
  SetConfigTextParams,
  SetConfigTextResult,
  SetConfigTextBody
>
