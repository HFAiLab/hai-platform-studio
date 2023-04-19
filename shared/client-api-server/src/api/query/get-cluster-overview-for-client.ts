import type { Merge } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取集群概况信息（给用户看的简略版）的接口参数
 */
export type GetClusterOverviewForClientParams = ApiServerParams

export interface ClusterOverviewDetail {
  /**
   * 使用率，working / total
   */
  usage_rate: number
  /**
   * 总节点
   */
  total: number
  /**
   * 其他，一般来说是 total - free - working
   */
  other: number
  /**
   * 空闲节点
   */
  free: number
  /**
   * 工作节点
   */
  working: number
}

/**
 * 获取集群概况信息（给用户看的简略版）的接口返回结果
 */
export type GetClusterOverviewForClientResult = Merge<
  ClusterOverviewDetail,
  {
    gpu_detail: ClusterOverviewDetail
    cpu_detail: ClusterOverviewDetail
  }
>

/**
 * 获取集群概况信息（给用户看的简略版）的接口配置
 */
export type GetClusterOverviewForClientApiConfig = ApiServerApiConfig<
  GetClusterOverviewForClientParams,
  GetClusterOverviewForClientResult
>
