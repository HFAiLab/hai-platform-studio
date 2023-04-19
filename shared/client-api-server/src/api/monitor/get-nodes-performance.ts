import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取节点性能数据的接口参数
 */
export type GetNodesPerformanceParams = ApiServerParams

/**
 * 获取节点性能数据的接口返回结果
 */
export interface GetNodesPerformanceResult {
  [nodeName: string]: NodesPerformanceItem
}

/**
 * 获取节点性能数据的接口配置
 */
export type GetNodesPerformanceApiConfig = ApiServerApiConfig<
  GetNodesPerformanceParams,
  GetNodesPerformanceResult
>

/**
 * 服务端返回节点性能数据
 */
export interface NodesPerformanceItem {
  /**
   * GPU 功率
   */
  gpupwr: number | null

  /**
   * GPU 显存
   */
  gpumem: number | null

  /**
   * GPU 温度
   */
  gputemp: number | null

  /**
   * IB RX GiB/s
   */
  ibrecv: number | null

  /**
   * IB TX GiB/s
   */
  ibtrans: number | null
}
