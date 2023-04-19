import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 查询全局任务信息 的接口参数
 */
export interface GetTaskTypedOverviewParams extends AilabServerParams {
  taskType: 'gpu' | 'cpu'
}

/**
 * 查询全局任务信息 的接口返回结果
 */
export interface GetTaskTypedOverviewResult {
  [key: string]: TaskOverview
}

export interface TaskOverview {
  scheduled: number
  queued: number
}

/**
 * 查询全局任务信息 的接口配置
 */
export type GetTaskTypedOverviewApiConfig = AilabServerApiConfig<
  GetTaskTypedOverviewParams,
  GetTaskTypedOverviewResult
>
