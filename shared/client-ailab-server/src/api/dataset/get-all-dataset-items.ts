import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { DatasetItem } from './schema'

export type DatasetGetAllDatasetItemsParams = AilabServerParams

export type DatasetGetAllDatasetItemsBody = {
  admin: boolean
}
/*
 * 获取所有数据集内容
 */
export type DatasetGetAllDatasetItemsResult = Array<DatasetItem>

export type DatasetGetAllDatasetItemsConfig = AilabServerApiConfig<
  DatasetGetAllDatasetItemsParams,
  DatasetGetAllDatasetItemsResult,
  DatasetGetAllDatasetItemsBody
>
