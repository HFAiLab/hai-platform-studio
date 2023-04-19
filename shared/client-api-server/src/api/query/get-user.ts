import type { SingleUserInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取当前用户信息接口参数
 */
export type GetUserParams = ApiServerParams

/**
 * 获取当前用户信息接口返回结果
 */
export type GetUserResult = SingleUserInfo

/**
 * 获取当前用户信息接口配置
 */
export type GetUserApiConfig = ApiServerApiConfig<GetUserParams, GetUserResult>
