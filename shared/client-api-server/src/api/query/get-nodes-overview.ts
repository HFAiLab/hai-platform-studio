import type { Node } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取节点概览的接口参数
 */
export type GetNodesOverviewParams = ApiServerParams

/**
 * 获取节点概览的接口返回结果
 */
export interface GetNodesOverviewResult {
  nodes: Node[]
  overview: NodesOverview
}

/**
 * 获取节点概览的接口配置
 */
export type GetNodesOverviewApiConfig = ApiServerApiConfig<
  GetNodesOverviewParams,
  GetNodesOverviewResult
>

/**
 * 节点概览数据类型
 */
export interface NodesOverview {
  cpu?: NodesOverviewItem
  gpu?: NodesOverviewItem
}

export interface NodesOverviewItem {
  count: NodesOverviewItemCount
  count_schedule_zone: {
    A?: NodesOverviewItemCount
    B?: NodesOverviewItemCount
  }
  detail: {
    err: Record<string, number>
    exclusive: Record<string, number>
    service: Record<string, number>
    train: {
      working: {
        internal: Record<string, number>
        external: Record<string, number>
      }
      free: Record<string, number>
      unschedulable: Record<string, number>
    }
  }
}

export interface NodesOverviewItemCount {
  dev_and_release: {
    total: number
    dev?: number
    release?: number
  }
  err: number
  exclusive: number
  service: number
  total: number
  train: {
    schedulable: {
      total: number
      free: number
      working: number
      internal_working: number
      external_working: number
    }
    total: number
    unschedulable: number
  }
}
