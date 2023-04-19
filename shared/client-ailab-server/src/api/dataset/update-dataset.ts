import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { DatasetItem } from './schema'

export type DatasetUpdateDatasetParams = AilabServerParams

export interface DatasetUpdateDatasetBody {
  id: string
  update_values: DatasetItem
}

/*
 * 更新数据集，返回结果是描述一则成功消息
 */
export type DatasetUpdateDatasetResult = string

export type DatasetUpdateDatasetConfig = AilabServerApiConfig<
  DatasetUpdateDatasetParams,
  DatasetUpdateDatasetResult,
  DatasetUpdateDatasetBody
>
