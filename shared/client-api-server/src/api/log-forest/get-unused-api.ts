import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export type LogForestGetUnusedApiApiParamsMode = 'minute' | '15_minutes' | 'hour' | 'day'

/**
 * 获取最近一段时间内没有用过的接口接口参数
 */
export interface LogForestGetUnusedApiApiParams extends ApiServerParams {
  /**
   * 天数，默认 7 天
   */
  days?: number
}

/**
 * 获取最近一段时间内没有用过的接口接口返回结果
 */
export interface LogForestGetUnusedApiApiResult {
  unused_api: string[]
}

/**
 * 获取最近一段时间内没有用过的接口接口配置
 */
export type LogForestGetUnusedApiApiConfig = ApiServerApiConfig<
  LogForestGetUnusedApiApiParams,
  LogForestGetUnusedApiApiResult
>
