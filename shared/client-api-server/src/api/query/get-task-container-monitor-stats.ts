import type { TaskNodesContainerMonitorStat } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取任务的 CPU 或内存数据的接口参数
 */
export type GetTaskContainerMonitorStatsParams = ApiServerParams

export interface TaskContainerMonitorStat {
  // task
  [key: string]: TaskNodesContainerMonitorStat
}

/**
 * 获取任务的 CPU 或内存数据的接口返回结果
 */
export type GetTaskContainerMonitorStatsResult = {
  container_memory_rss: TaskContainerMonitorStat
  container_cpu_usage: TaskContainerMonitorStat
}

/**
 * 获取任务的 CPU 或内存数据的接口配置
 */
export type GetTaskContainerMonitorStatsApiConfig = ApiServerApiConfig<
  GetTaskContainerMonitorStatsParams,
  GetTaskContainerMonitorStatsResult
>
