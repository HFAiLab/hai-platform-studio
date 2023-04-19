import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 取消设置任务的 Tag（比如 Star 实验）的请求参数：
 */
export interface UnTagTaskParams extends ApiServerParams {
  chain_id: string

  tag: string
}

/*
 * 取消设置任务的 Tag（比如 Star 实验）的主要响应内容：
 */
export interface UnTagTaskResult {
  msg?: string
}

export type UnTagTaskConfig = ApiServerApiConfig<UnTagTaskParams, UnTagTaskResult>
