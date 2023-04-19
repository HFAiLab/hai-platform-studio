import type { SyncFileType, SyncStatusList } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取文件同步状态（主要用于 workspace）的请求参数：
 */
export type GetSyncStatusParams = ApiServerParams & {
  file_type: SyncFileType

  name: string
}

/*
 * 获取文件同步状态（主要用于 workspace）的响应内容：
 */
export interface GetSyncStatusResult {
  data: SyncStatusList
}

export type GetSyncStatusApiConfig = ApiServerApiConfig<GetSyncStatusParams, GetSyncStatusResult>
