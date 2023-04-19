import type { AilabServerApiConfig, AilabServerParams } from '../../types'

// UpdatePath
export type DatasetUpdatePathParams = AilabServerParams

export type DatasetUpdatePathBody = {
  id: string
  type: 'nfsHostPath' | 'clusterHostPath' | 'clusterPath'
  path: string
}

/*
 * 执行该 stage 的动作 返回结果是描述一则成功消息
 */
export type DatasetUpdatePathResult = string

export type DatasetUpdatePathConfig = AilabServerApiConfig<
  DatasetUpdatePathParams,
  DatasetUpdatePathResult,
  DatasetUpdatePathBody
>
