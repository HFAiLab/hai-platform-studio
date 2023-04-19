import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 直接重启运行中的实验的请求参数：
 */
export type ServiceTaskRestartParams = ApiServerParams & ChainTaskRequestInfo
/*
 * 直接重启运行中的实验的主要响应内容：
 */
export interface ServiceTaskRestartResult {
  msg?: string
}

export type ServiceTaskRestartConfig = ApiServerApiConfig<
  ServiceTaskRestartParams,
  ServiceTaskRestartResult
>
