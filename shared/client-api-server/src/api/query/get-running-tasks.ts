import type { RunningTask, TaskTaskType } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取运行中的任务的接口参数
 */
export interface GetRunningTasksParams extends ApiServerParams {
  /**
   * 任务类型
   */
  task_type?: TaskTaskType[]
}

/**
 * 获取运行中的任务的接口返回结果
 */
export type GetRunningTasksResult = RunningTask[]

/**
 * 获取运行中的任务的接口配置
 */
export type GetRunningTasksApiConfig = ApiServerApiConfig<
  GetRunningTasksParams,
  GetRunningTasksResult
>
