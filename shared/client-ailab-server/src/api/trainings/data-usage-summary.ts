import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取用量信息 的接口参数
 */
export interface DataUsageSummaryParams extends AilabServerParams {
  type: 'user' | 'group'
}

export interface DataUsageSummary {
  chain_task_count: number
  gpu_hours: number
  avg_gpu_util?: number
  shared_group?: string
  user_name?: string
}

/**
 * 获取用量信息 的接口返回结果
 */
export interface DataUsageSummaryResult {
  date: string
  data: DataUsageSummary | null
}

/**
 * 获取用量信息 的接口配置
 */
export type DataUsageSummaryApiConfig = AilabServerApiConfig<
  DataUsageSummaryParams,
  DataUsageSummaryResult
>
