import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * [管理员接口] 打断任务，支持按 task id / chain id / nb_name 操作
 */
export type SuspendTaskParams = ApiServerParams & ChainTaskRequestInfo

export interface SuspendTaskResult {
  msg?: string
}

export type SuspendTaskConfig = ApiServerApiConfig<SuspendTaskParams, SuspendTaskResult>
