import type { ExternalStorageUsage } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取外部用户存储情况的接口参数
 */
export type GetExternalUserStorageStatParams = { token: string } & ApiServerParams

/**
 * 获取外部用户存储情况返回结果
 */
export type GetExternalUserStorageStatResult = {
  [user: string]: ExternalStorageUsage
}

/**
 * 获取外部用户存储情况接口配置
 */
export type GetExternalUserStorageStatApiConfig = ApiServerApiConfig<
  GetExternalUserStorageStatParams,
  GetExternalUserStorageStatResult
>
