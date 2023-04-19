import type { ClusterUnit } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取集群节点信息的接口参数
 */
export interface ClusterDFParams extends ApiServerParams {
  /**
   * 如果 monitor 为 false，就不查性能数据了
   */
  monitor?: boolean
}

/**
 * 获取集群节点信息的接口返回结果
 */
export interface ClusterDFResult {
  /**
   * 集群节点信息组成的数组
   */
  cluster_df: Array<ClusterUnit>

  /**
   * container 列表
   */
  containers: string[]

  /**
   * mount_code: 挂载点列表
   */
  mount_code: Record<number, string>
}

/**
 * 获取集群节点信息的接口配置
 */
export type ClusterDFApiConfig = ApiServerApiConfig<ClusterDFParams, ClusterDFResult>
