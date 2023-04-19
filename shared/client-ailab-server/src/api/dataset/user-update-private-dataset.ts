import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { DatasetItem } from './schema'

export type DatasetUserUpdatePrivateDatasetParams = AilabServerParams

export interface DatasetUserUpdatePrivateDatasetBody {
  id: string
  update_values: Partial<DatasetItem>
}

/*
 * 更新数据集，返回结果是描述一则成功消息
 */
export type DatasetUserUpdatePrivateDatasetResult = string

export type DatasetUserUpdatePrivateDatasetConfig = AilabServerApiConfig<
  DatasetUserUpdatePrivateDatasetParams,
  DatasetUserUpdatePrivateDatasetResult,
  DatasetUserUpdatePrivateDatasetBody
>
