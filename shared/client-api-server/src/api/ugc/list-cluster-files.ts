import type { SyncFileType, WorkspaceFileLists } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取文件列表（主要用于 workspace）的请求参数：
 */
export interface ListClusterFilesParams extends ApiServerParams {
  file_type: SyncFileType
  name: string | string[]
  page: number
  size: number
  /**
   * 是否递归地去子文件夹中获取内容
   */
  recursive: boolean
  /**
   * no_checksum 会比较快，studio 无需开启
   */
  no_checksum: boolean
}

export interface ListClusterFilesBody {
  file_list: {
    files: string[]
  }
}

/*
 * 获取文件列表（主要用于 workspace）的主要响应内容：
 */
export type ListClusterFilesResult = WorkspaceFileLists

export type ListClusterFilesConfig = ApiServerApiConfig<
  ListClusterFilesParams,
  ListClusterFilesResult,
  ListClusterFilesBody
>
