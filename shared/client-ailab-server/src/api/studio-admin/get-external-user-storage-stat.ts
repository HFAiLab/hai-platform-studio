import type { ExternalStorageUsage } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams, NanoDatasetMeta } from '../../types'

/**
 * 获取外部用户活跃情况的接口参数
 */
export type GetExternalUserStorageStatParams = { token: string } & AilabServerParams

/**
 * 获取外部用户活跃情况返回结果
 */
export type GetExternalUserStorageStatResult = {
  [user: string]: ExternalStorageUsage & {
    shared_group: string
    chinese_name: string
    group_ds_list?: NanoDatasetMeta[]
    ds_list?: NanoDatasetMeta[]
  }
}

/**
 * 获取外部用户活跃情况接口配置
 */
export type GetExternalUserStorageStatApiConfig = AilabServerApiConfig<
  GetExternalUserStorageStatParams,
  GetExternalUserStorageStatResult
>
