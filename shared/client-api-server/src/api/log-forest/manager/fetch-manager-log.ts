import type { ApiServerApiConfig, ApiServerParams } from '../../../types'

/**
 * 获取 Manager 日志单条日志接口参数
 */
export interface LogForestFetchManagerLogApiParams extends ApiServerParams {
  task_id: number
}

/**
 * 获取 Manager 日志单条日志接口返回结果
 */
export interface LogForestFetchManagerLogApiResult {
  log: string
}

/**
 * 获取 Manager 日志单条日志接口配置
 */
export type LogForestFetchManagerLogApiConfig = ApiServerApiConfig<
  LogForestFetchManagerLogApiParams,
  LogForestFetchManagerLogApiResult
>
