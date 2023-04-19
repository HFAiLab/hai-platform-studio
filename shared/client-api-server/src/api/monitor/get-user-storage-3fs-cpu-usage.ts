import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取个人存储的使用情况 (3fs cpu) 请求参数：
 */
export type GetUserStorage3fsCPUUsageParams = ApiServerParams

export interface InternalStorage3fsCPUUsageCommon {
  private?: {
    used_bytes: number
  }
}

export interface InternalStorage3fsCPUUsage {
  '3fs_cpu_prod'?: {
    limit_bytes: number
    used_bytes: number
  }
  'bigger'?: InternalStorage3fsCPUUsageCommon
  'safer'?: InternalStorage3fsCPUUsageCommon
  // 数据采集的时间
  'timestamp'?: string
}

/*
 * 获取个人存储的使用情况 (3fs cpu) 响应内容：
 */
export type GetUserStorage3fsCPUUsageResult = InternalStorage3fsCPUUsage

export type GetUserStorage3fsCPUUsageApiConfig = ApiServerApiConfig<
  GetUserStorage3fsCPUUsageParams,
  GetUserStorage3fsCPUUsageResult
>
