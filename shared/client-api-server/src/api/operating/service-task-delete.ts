import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 删除一个任务（用于开发容器服务）请求参数：
 */
export type ServiceTaskDeleteParams = ApiServerParams & ChainTaskRequestInfo

/*
 * 删除一个任务（用于开发容器服务）主要响应内容：
 */
export interface ServiceTaskDeleteResult {
  msg?: string
}

export type ServiceTaskDeleteConfig = ApiServerApiConfig<
  ServiceTaskDeleteParams,
  ServiceTaskDeleteResult
>
