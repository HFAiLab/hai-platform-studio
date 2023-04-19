import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 重跑实验的请求参数：
 */
export type ResumeTaskParams = ApiServerParams & ChainTaskRequestInfo

/*
 * 重跑实验的主要响应内容：
 */
export interface ResumeTaskResult {
  msg?: string
}

export type ResumeTaskConfig = ApiServerApiConfig<ResumeTaskParams, ResumeTaskResult>
