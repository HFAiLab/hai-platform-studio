import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 设置任务的 Tag（比如 Star 实验）的最新版本请求参数：
 */
export interface TagTaskParams extends ApiServerParams {
  chain_id: string

  tag: string
}

/*
 * 设置任务的 Tag（比如 Star 实验）的主要响应内容：
 */
export interface TagTaskResult {
  msg?: string
}

export type TagTaskConfig = ApiServerApiConfig<TagTaskParams, TagTaskResult>
