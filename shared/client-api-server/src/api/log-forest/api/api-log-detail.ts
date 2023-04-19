import type { ApiServerApiConfig } from '../../../types'
import type { LogForestLogDetailApiParams } from '../common'

/**
 * 获取日志大盘详情数据的接口参数
 */
export type LogForestApiLogDetailApiParams = LogForestLogDetailApiParams

export type LogForestRelations = 'host->server' | 'server->path' | 'path->user_name'

export enum LogForestHostTableType {
  HOST = 'host',
  SERVER = 'server',
  PATH = 'path',
  USER_NAME = 'user_name',
}

export interface LogForestNodeExtraInfo {
  request_count: number
  info_count: number
  warning_count: number
  error_count: number
  info_sample: string[]
  warning_sample: string[]
  error_sample: string[]
  response_cost_min: number
  response_cost_mean: number
  response_cost_max: number
  response_cost_pct75: number
  response_cost_pct99: number
  response_cost_std: number
}

export interface LogForestLogDataOverviewRelation extends LogForestNodeExtraInfo {
  source: string
  target: string
}

/**
 * 获取日志大盘详情数据的接口返回结果
 */
export interface LogForestApiLogDetailApiResult {
  relation: {
    [key in LogForestRelations]: LogForestLogDataOverviewRelation[]
  }
  detail: {
    [key in LogForestHostTableType]: {
      [key: string]: LogForestNodeExtraInfo
    }
  }
}

/**
 * 获取日志大盘详情数据的接口配置
 */
export type LogForestApiLogDetailApiConfig = ApiServerApiConfig<
  LogForestApiLogDetailApiParams,
  LogForestApiLogDetailApiResult
>
