import type { SingleUserInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取 Studio 用户信息 的接口参数
 */
export type SafeGetUserInfoParams = AilabServerParams

export declare type StudioUser = SingleUserInfo & {
  admin?: boolean
}

export interface SafeGetUserInfoBody {
  /**
   * 这里的 token 可能有点多余，但是是为了向前兼容
   */
  token: string
  name: string
}

/**
 * 获取 Studio 用户信息 的接口返回结果
 */
export type SafeGetUserInfoResult = {
  data: StudioUser
}

/**
 * 获取 Studio 用户信息 的接口配置
 */
export type SafeGetUserInfoApiConfig = AilabServerApiConfig<
  SafeGetUserInfoParams,
  SafeGetUserInfoResult,
  SafeGetUserInfoBody
>
