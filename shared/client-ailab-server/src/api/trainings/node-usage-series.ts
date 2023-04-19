import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type NodeUsageItem =
  | {
      time: number
      all_node: number
      working: number
      free: number
      other: number
    }
  | {
      time: number
      all_node: null
      working: null
      free: null
      other: null
    }

export type NodeUsageSeriesResult = NodeUsageItem[]

/**
 * 查询全局任务信息 的接口参数
 */
export interface GetNodeUsageSeriesParams extends AilabServerParams {
  type: 'gpu' | 'cpu'
}

/**
 * 查询全局任务信息 的接口返回结果
 */
export type GetNodeUsageSeriesResult = NodeUsageSeriesResult

/**
 * 查询全局任务信息 的接口配置
 */
export type GetNodeUsageSeriesApiConfig = AilabServerApiConfig<
  GetNodeUsageSeriesParams,
  GetNodeUsageSeriesResult
>
