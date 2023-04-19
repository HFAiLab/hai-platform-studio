import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { CreatePrivateDatasetSettings, DatasetItem } from './schema'

export type DatasetCreatePrivateDatasetParams = AilabServerParams

export type DatasetCreatePrivateDatasetBody = CreatePrivateDatasetSettings

/*
 * 创建私有数据集，返回创建的数据集
 */
export type DatasetCreatePrivateDatasetResult = DatasetItem

export type DatasetCreatePrivateDatasetConfig = AilabServerApiConfig<
  DatasetCreatePrivateDatasetParams,
  DatasetCreatePrivateDatasetResult,
  DatasetCreatePrivateDatasetBody
>
