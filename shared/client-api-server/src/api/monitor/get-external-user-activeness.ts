import type { ExternalUserActivenessItem } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取外部用户活跃情况的接口参数
 */
export type GetExternalUserActivenessParams = ApiServerParams

/**
 * 获取外部用户活跃情况返回结果
 */
export type GetExternalUserActivenessResult = {
  success: 1 | 0
  msg?: string
  result: Record<string, ExternalUserActivenessItem>
}

/**
 * 获取外部用户活跃情况接口配置
 */
export type GetExternalUserActivenessApiConfig = ApiServerApiConfig<
  GetExternalUserActivenessParams,
  GetExternalUserActivenessResult
>
