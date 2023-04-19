import type { StorageQuotaTreeNode, StorageQuotaType } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'
import type { GetStorageQuotaResult } from './get-storage-quota'

/**
 * 获取存储配额的接口参数
 */
export interface GetStorageQuotaHistoryParams extends ApiServerParams {
  storage_type?: StorageQuotaType
  ticks: string[]
  to_tree?: boolean
}

/**
 * 获取存储配额的接口返回结果
 */
export type GetStorageQuotaHistoryResult = [
  previous: GetStorageQuotaResult,
  current: GetStorageQuotaResult,
]

export type GetStorageQuotaTreeHistoryResult = [
  previous: StorageQuotaTreeNode,
  current: StorageQuotaTreeNode,
]

/**
 * 获取存储配额的接口配置
 */
export type GetStorageQuotaHistoryApiConfig = ApiServerApiConfig<
  GetStorageQuotaHistoryParams,
  GetStorageQuotaHistoryResult | GetStorageQuotaTreeHistoryResult
>
