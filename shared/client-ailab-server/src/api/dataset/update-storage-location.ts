import type { AilabServerApiConfig, AilabServerParams } from '../../types'

// UpdateStorageLocation
export type DatasetUpdateStorageLocationParams = AilabServerParams

export type DatasetUpdateStorageLocationBody = {
  id: string
  location: 'weka' | '3fs' | 'temp' | 'none'
}

/*
 * 执行该 stage 的动作 返回结果是描述一则成功消息
 */
export type DatasetUpdateStorageLocationResult = string

export type DatasetUpdateStorageLocationConfig = AilabServerApiConfig<
  DatasetUpdateStorageLocationParams,
  DatasetUpdateStorageLocationResult,
  DatasetUpdateStorageLocationBody
>
