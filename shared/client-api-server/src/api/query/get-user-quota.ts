import type { User } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取当前用户配额的接口参数
 */
export type GetUserQuotaParams = ApiServerParams

/**
 * 获取当前用户配额的接口返回结果
 */
export type GetUserQuotaResult = Pick<User, 'user_name'> & {
  quota: Record<string, number>
  quota_limit: Record<string, number>
  all_quota: Record<string, number>
  already_used_quota: Record<string, number>
}

/**
 * 获取当前用户配额的接口配置
 */
export type GetUserQuotaApiConfig = ApiServerApiConfig<GetUserQuotaParams, GetUserQuotaResult>
