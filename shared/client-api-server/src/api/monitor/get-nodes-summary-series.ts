import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取节点使用统计数据的接口参数
 */
export interface GetNodesSummarySeriesParams extends ApiServerParams {
  type?: 'gpu' | 'cpu'
}

/**
 * 获取节点使用统计数据的接口返回结果
 */
export type GetNodesSummarySeriesResult = NodesSummarySeriesItem[]

/**
 * 获取节点使用统计数据的接口配置
 */
export type GetNodesSummarySeriesApiConfig = ApiServerApiConfig<
  GetNodesSummarySeriesParams,
  GetNodesSummarySeriesResult
>

/**
 * 服务端返回节点的使用统计数据
 */
export interface NodesSummarySeriesItem {
  time: number

  all_node: number | null
  dev: number | null
  exclusive: number | null
  external_working: number | null
  free: number | null
  internal_working: number | null
  release: number | null
  service: number | null
  train_node_total: number | null
  unavailable: number | null
  working: number | null

  detail: NodeSummarySeriesItemDetail | null
}

/**
 * 节点的使用统计数据详情类型
 */
export interface NodeSummarySeriesItemDetail {
  err: Record<string, number>
  service: Record<string, number>
  exclusive: Record<string, number>
  train: {
    working: {
      internal: Record<string, number>
      external: Record<string, number>
    }
    free: Record<string, number>
    unschedulable: Record<string, number>
  }
}
