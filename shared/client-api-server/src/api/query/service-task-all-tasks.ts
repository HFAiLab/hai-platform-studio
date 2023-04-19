import type { ContainerTaskByAdmin } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 开发容器需求，获取所有任务的接口参数
 */
export interface ServiceTaskAllTasksApiParams extends ApiServerParams {
  page: number

  page_size: number
}

/**
 * 开发容器需求，获取所有任务的接口返回结果
 */
export interface ServiceTaskAllTasksApiResult {
  tasks: ContainerTaskByAdmin[]

  nodeport_quota: undefined

  total_count: number
}

/**
 * 开发容器需求，获取所有任务的接口配置
 */
export type ServiceTaskAllTasksApiConfig = ApiServerApiConfig<
  ServiceTaskAllTasksApiParams,
  ServiceTaskAllTasksApiResult
>
