import type { UserNodeQuotaInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 查询用户配额 的接口参数
 */
export interface UserNodeQuotaInfoParams extends AilabServerParams {
  force?: boolean
}

/**
 * 查询用户配额 的接口返回结果
 */
export type UserNodeQuotaInfoResult = UserNodeQuotaInfo

/**
 * 查询用户配额 的接口配置
 */
export type UserNodeQuotaInfoApiConfig = AilabServerApiConfig<
  UserNodeQuotaInfoParams,
  UserNodeQuotaInfoResult
>
