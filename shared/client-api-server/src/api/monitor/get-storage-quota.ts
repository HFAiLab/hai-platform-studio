import type { StorageQuotaTreeNode, StorageQuotaType } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取存储配额的接口参数
 */

export interface GetStorageQuotaParams extends ApiServerParams {
  storage_type?: StorageQuotaType
  to_tree?: boolean
}

/**
 * 获取存储配额的接口返回结果
 */
export interface GetStorageQuotaResult {
  [path: string]: StorageQuotaItem
}

export type GetStorageQuotaTreeResult = StorageQuotaTreeNode

/**
 * 获取存储配额的接口配置
 */
export type GetStorageQuotaApiConfig = ApiServerApiConfig<
  GetStorageQuotaParams,
  GetStorageQuotaResult | GetStorageQuotaTreeResult
>

/**
 * 服务端返回存储配额数据
 *
 * @see `get_weka_quota()`
 */
export interface StorageQuotaItem {
  /**
   * 存储限额 bytes
   */
  limit_bytes?: number | null

  /**
   * 已使用存储量 bytes
   */
  used_bytes?: number

  /**
   * 服务器端的更新时间
   */
  time?: string

  /**
   * 是否拿到了这个目录的用量数据
   */
  fetched_data?: number
  /**
   * 子目录的用量加和
   */
  sum_bytes?: number
  /**
   * 当前目录下 unknown 的大小
   */
  unknown_bytes?: number
}
