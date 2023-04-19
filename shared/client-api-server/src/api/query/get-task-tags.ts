import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 查询用户所有任务的 tag
 */
export type GetTaskTagsParams = ApiServerParams

/**
 * 查询用户所有任务的 tag 的返回结果
 */
export type GetTaskTagsResult = string[]

/**
 * 查询当前用户单个任务的接口配置
 */
export type GetTaskTagsApiConfig = ApiServerApiConfig<GetTaskTagsParams, GetTaskTagsResult>
