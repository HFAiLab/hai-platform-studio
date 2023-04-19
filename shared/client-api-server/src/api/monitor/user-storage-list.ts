import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取用户个人可用的挂在路径和容量 请求参数：
 */
export type GetUserPersonalStorageParams = ApiServerParams

export interface IStorageItem {
  host_path?: string
  mount_path: string
  mount_type: 'Directory' | 'File' | ''
  read_only: boolean
  src: string
}

/*
 * 获取用户个人可用的挂在路径和容量 响应内容：
 */
export type GetUserPersonalStorageResult = {
  storages: Array<IStorageItem>
}

export type GetUserPersonalStorageConfig = ApiServerApiConfig<
  GetUserPersonalStorageParams,
  GetUserPersonalStorageResult
>
