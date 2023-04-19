import type { ExternalStorageUsage } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取外部用户存储用量 的接口参数
 */
export type ExternalUserStorageUsageParams = AilabServerParams

/**
 * 获取外部用户存储用量 的接口返回结果
 */
export interface ExternalUserStorageUsageResult {
  usage: ExternalStorageUsage
}

/**
 * 获取外部用户存储用量 的接口配置
 */
export type ExternalUserStorageUsageApiConfig = AilabServerApiConfig<
  ExternalUserStorageUsageParams,
  ExternalUserStorageUsageResult
>
