import type { NodeScheduleZone } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取任务分布情况的接口参数
 */
export interface GetTasksDistributionParams extends ApiServerParams {
  node_step: number
  distribute_type?: TasksDistributionDistributeType
  schedule_zone?: NodeScheduleZone
}

/**
 * 获取任务分布情况的接口返回结果
 */
export interface GetTasksDistributionResult {
  x_axis: string[]
  y_axis: number[]
  task_count: Record<string, number>
  data: [x: number, y: number, value: number | string][]
}

/**
 * 获取任务分布情况的接口配置
 */
export type GetTasksDistributionApiConfig = ApiServerApiConfig<
  GetTasksDistributionParams,
  GetTasksDistributionResult
>

/**
 * 任务分布类型
 */
export enum TasksDistributionDistributeType {
  SPINE = 'spine',
  LEAF = 'leaf',
}
