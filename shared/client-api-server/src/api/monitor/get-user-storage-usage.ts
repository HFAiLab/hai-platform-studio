import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取个人存储的使用情况 请求参数：
 */
export type GetUserStorageUsageParams = ApiServerParams

export interface InternalStorageUsage {
  permanent: {
    limit_bytes: number
    used_bytes: number
    sub_paths: {
      jupyter: {
        used_bytes: number
      }
      containers: {
        used_bytes: number
      }
      private: {
        used_bytes: number
      }
    }
  }
  gc_long_term: {
    limit_bytes: number
    used_bytes: number
  }
  gc_long_term_shared?: {
    limit_bytes: number
    used_bytes: number
  }
  gc_short_term: {
    limit_bytes: number
    used_bytes: number
  }
  gc_short_term_shared?: {
    limit_bytes: number
    used_bytes: number
  }
  weka_prod: {
    limit_bytes: number
    used_bytes: number
  }
  alpha_team_shared?: {
    limit_bytes: number
    used_bytes: number
  }
  // 数据采集的时间
  timestamp?: string
}

export interface ExternalStorageUsage {
  group: {
    limit_bytes: number | null
    used_bytes: number
    shared_used_bytes: number
    user_used_bytes: {
      [user: string]: number
    }
  }
  timestamp?: string
}

/*
 * 获取个人存储的使用情况 响应内容：
 */
export type GetUserStorageUsageResult = InternalStorageUsage | ExternalStorageUsage

export type GetUserStorageUsageApiConfig = ApiServerApiConfig<
  GetUserStorageUsageParams,
  GetUserStorageUsageResult
>
