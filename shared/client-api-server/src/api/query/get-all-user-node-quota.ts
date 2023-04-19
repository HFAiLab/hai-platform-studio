import type { SingleUserNodeTotalQuota } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取全部用户总配额的接口参数
 */
export type GetAllUserNodeQuotaParams = ApiServerParams

/**
 * 获取全部用户总配额的接口返回结果
 */
export type GetAllUserNodeQuotaResult = {
  [user: string]: SingleUserNodeTotalQuota
}

/**
 * 获取全部用户总配额的接口配置
 */
export type GetAllUserNodeQuotaApiConfig = ApiServerApiConfig<
  GetAllUserNodeQuotaParams,
  GetAllUserNodeQuotaResult
>
