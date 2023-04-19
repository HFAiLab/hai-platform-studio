import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 检查用户 的接口参数
 */
export type CheckUserParams = AilabServerParams

export interface CheckUserBody {
  name: string
  token: string
}

/**
 * 检查用户 的接口返回结果
 */
export interface CheckUserResult {
  match: boolean
  token: string
  name: string
}

/**
 * 检查用户 的接口配置
 */
export type CheckUserApiConfig = AilabServerApiConfig<
  CheckUserParams,
  CheckUserResult,
  CheckUserBody
>
