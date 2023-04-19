import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取单个任务性能数据的接口参数
 */
export interface TaskPerfApiParams extends ApiServerParams {
  chain_id: string
}

export interface TaskPerf {
  gpu_util: number
  gpu_power: number
  ib_recv: number
  ib_trans: number
}

/**
 * 获取单个任务性能数据的接口返回结果
 */
export interface TaskPerfApiResult {
  data: TaskPerf
}

/**
 * 获取单个任务性能数据的接口配置
 */
export type TaskPerfApiConfig = ApiServerApiConfig<TaskPerfApiParams, TaskPerfApiResult>
