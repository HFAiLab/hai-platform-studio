import type { TaskNodesContainerMonitorStat } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface TaskCurrentPerfStat {
  cpu?: TaskNodesContainerMonitorStat | null | undefined
  mem?: TaskNodesContainerMonitorStat | null | undefined
  gpu_util?: TaskNodesContainerMonitorStat | null | undefined
  gpu_power?: TaskNodesContainerMonitorStat | null | undefined
  gpu_p2u?: TaskNodesContainerMonitorStat | null | undefined
  ib_rx?: TaskNodesContainerMonitorStat | null | undefined
  ib_tx?: TaskNodesContainerMonitorStat | null | undefined
}

/**
 * 获取通用性能数据 的接口参数
 */
export interface GetTaskCurrentPerfV2Params extends AilabServerParams {
  keys: (keyof TaskCurrentPerfStat)[]
  task_id?: number // cpu & mem 的时候必填
  // deleted: 目前用 task_id 足矣
  // nodes?: string[] // gpu_util、ib_rx、ib_tx 的时候必填
}

/**
 * 获取通用性能数据 的接口返回结果
 */
export interface GetTaskCurrentPerfV2Result {
  perfs: TaskCurrentPerfStat
}

/**
 * 获取通用性能数据 的接口配置
 */
export type GetTaskCurrentPerfV2ApiConfig = AilabServerApiConfig<
  GetTaskCurrentPerfV2Params,
  GetTaskCurrentPerfV2Result
>
