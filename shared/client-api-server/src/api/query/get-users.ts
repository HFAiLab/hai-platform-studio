import type { User } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取全部用户信息接口参数
 */
export type GetUsersParams = ApiServerParams

/**
 * 获取全部用户信息接口返回结果
 */
export type GetUsersResult = User[]

/**
 * 获取全部用户信息接口配置
 */
export type GetUsersApiConfig = ApiServerApiConfig<GetUsersParams, GetUsersResult>
