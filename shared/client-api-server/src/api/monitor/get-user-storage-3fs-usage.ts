import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取个人存储的使用情况 (3fs) 请求参数：
 */
export type GetUserStorage3fsUsageParams = ApiServerParams

export interface InternalStorage3fsUsage {
  '3fs_prod'?: {
    limit_bytes: number
    used_bytes: number
  }
  'private'?: {
    used_bytes: number
  }
  // 数据采集的时间
  'timestamp'?: string
}

/*
 * 获取个人存储的使用情况 (3fs) 响应内容：
 */
export type GetUserStorage3fsUsageResult = InternalStorage3fsUsage

export type GetUserStorage3fsUsageApiConfig = ApiServerApiConfig<
  GetUserStorage3fsUsageParams,
  GetUserStorage3fsUsageResult
>
