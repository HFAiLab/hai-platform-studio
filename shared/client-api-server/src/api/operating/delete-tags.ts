import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 删除所有任务中的指定 tag：
 */
export interface DeleteTagsParams extends ApiServerParams {
  tag: string[] | string
}

/*
 * 取消设置任务的 Tag（比如 Star 实验）的主要响应内容：
 */
export interface DeleteTagsResult {
  msg?: string
}

export type DeleteTagsConfig = ApiServerApiConfig<DeleteTagsParams, DeleteTagsResult>
