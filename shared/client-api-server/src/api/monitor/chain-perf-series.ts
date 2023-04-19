import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export type ChainPerfSeriesType =
  | 'gpu'
  | 'cpu'
  | 'every_card'
  | 'every_card_power'
  | 'every_card_mem'
  | 'mem'

/**
 * 获取单个任务性能数据的接口参数
 */
export interface ChainPerfSeriesParams extends ApiServerParams {
  chain_id: string

  typ: ChainPerfSeriesType

  rank: number

  data_interval: '5min' | '1min'
}

export type ChainPerfSeriesUnit = {
  /**
   * 开始时间 linux 时间戳，例如 1661221927
   */
  start: number
  /**
   * 结束时间 linux 时间戳，例如 1661231439
   */
  end: number
  series: Array<Array<number | null>>
  id: string | number
  rank: number
  type: ChainPerfSeriesType
  node?: string
}

/**
 * 获取单个任务性能数据的接口返回结果
 */
export interface ChainPerfSeriesResult {
  data: Array<ChainPerfSeriesUnit>
}

/**
 * 获取单个任务性能数据的接口配置
 */
export type ChainPerfSeriesConfig = ApiServerApiConfig<ChainPerfSeriesParams, ChainPerfSeriesResult>
