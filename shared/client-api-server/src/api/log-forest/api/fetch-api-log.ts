import type { ApiServerApiConfig, ApiServerParams } from '../../../types'

export type LogForestFetchApiLogApiParamsMode = 'minute' | '15_minutes' | 'hour' | 'day'

/**
 * 获取日志大盘单条日志接口参数
 */
export interface LogForestFetchApiLogApiParams extends ApiServerParams {
  req_uuid: string
}

/**
 * 获取日志大盘单条日志接口返回结果
 */
export interface LogForestFetchApiLogApiResult {
  log: string
}

/**
 * 获取日志大盘单条日志接口配置
 */
export type LogForestFetchApiLogApiConfig = ApiServerApiConfig<
  LogForestFetchApiLogApiParams,
  LogForestFetchApiLogApiResult
>
