import type { ExtendedTask } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 查询当前用户单个任务的接口参数
 */
export interface GetUserTaskParams extends ApiServerParams {
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
 * 查询当前用户单个任务的接口返回结果
 */
export interface GetUserTaskResult {
  /**
   * 查询到的任务
   */
  task: ExtendedTask
}

/**
 * 查询当前用户单个任务的接口配置
 */
export type GetUserTaskApiConfig = ApiServerApiConfig<GetUserTaskParams, GetUserTaskResult>
