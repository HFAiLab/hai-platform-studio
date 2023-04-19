import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 停止实验的请求参数：
 */
export type StopTaskParams = ApiServerParams & ChainTaskRequestInfo

/*
 * 停止实验的主要响应内容：
 */
export interface StopTaskResult {
  msg?: string
}

export type StopTaskConfig = ApiServerApiConfig<StopTaskParams, StopTaskResult>
