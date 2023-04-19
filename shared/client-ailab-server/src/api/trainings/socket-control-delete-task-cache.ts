import type { ExtendedTask } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 删除长链接的 Task 缓存的接口参数
 */
export type SocketControlDeleteTaskCacheParams = AilabServerParams

/**
 * 删除长链接的 Task 缓存的接口参数
 */
export interface SocketGetUserTaskParams extends AilabServerParams {
  /**
   * 任务 ID
   */
  id?: ExtendedTask['id']

  /**
   * 任务 chain ID
   */
  chain_id?: ExtendedTask['chain_id']

  /**
   * 任务名称
   */
  nb_name?: ExtendedTask['nb_name']
}

/**
 * 删除长链接的 Task 缓存的请求 Body
 */
export interface SocketControlDeleteTaskCacheBody {
  paramsList: SocketGetUserTaskParams[]
}

export type SocketControlDeleteTaskCacheResult = undefined

/**
 * 删除长链接的 Task 缓存的接口配置
 */
export type SocketControlDeleteTaskCacheApiConfig = AilabServerApiConfig<
  SocketControlDeleteTaskCacheParams,
  SocketControlDeleteTaskCacheResult,
  SocketControlDeleteTaskCacheBody
>
