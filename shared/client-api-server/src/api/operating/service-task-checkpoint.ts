import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 给一个开发容器 Set checkpoint 请求参数：
 */
export type ServiceTaskCheckPointParams = ApiServerParams & ChainTaskRequestInfo

/*
 * 给一个开发容器 Set checkpoint 主要响应内容：
 */
export interface ServiceTaskCheckPointResult {
  msg?: string
}

export type ServiceTaskCheckPointConfig = ApiServerApiConfig<
  ServiceTaskCheckPointParams,
  ServiceTaskCheckPointResult
>
