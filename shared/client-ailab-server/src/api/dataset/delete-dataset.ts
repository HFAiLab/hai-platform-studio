import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type DatasetDeleteDatasetParams = AilabServerParams

export interface DatasetDeleteDatasetBody {
  id: string
}
/*
 * 删除指定 id 的数据集，返回结果是描述一则成功消息
 */
export type DatasetDeleteDatasetResult = string

export type DatasetDeleteDatasetConfig = AilabServerApiConfig<
  DatasetDeleteDatasetParams,
  DatasetDeleteDatasetResult,
  DatasetDeleteDatasetBody
>
