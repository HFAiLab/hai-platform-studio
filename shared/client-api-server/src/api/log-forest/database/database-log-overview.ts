import type { ApiServerApiConfig, ApiServerParams } from '../../../types'

/**
 * 获取数据库大盘概况的接口参数
 */
export interface LogForestDataBaseLogOverviewApiParams extends ApiServerParams {
  /**
   * 开始区间
   */
  start_time: string
  /**
   * 结束区间
   */
  end_time: string
}

export type LogForestDataBaseLogType = 'common_log' | 'slow_query'

export interface LogForestDataBaseLogOverviewMeta {
  abstract: string
  application_name: string
  count: number
  duration_mean: number | null
  duration_pct75: number | null
  duration_pct99: number | null
  remote_host: string
  remote_ip: string | null
  type: LogForestDataBaseLogType
}

/**
 * 获取数据库大盘概况的接口返回结果
 */
export type LogForestDataBaseLogOverviewApiResult = LogForestDataBaseLogOverviewMeta[]

/**
 * 获取数据库大盘概况的接口配置
 */
export type LogForestDataBaseLogOverviewApiConfig = ApiServerApiConfig<
  LogForestDataBaseLogOverviewApiParams,
  LogForestDataBaseLogOverviewApiResult
>
