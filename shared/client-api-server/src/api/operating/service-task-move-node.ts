import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 移动释放一个节点请求参数：
 */
export interface ServiceTaskMoveNodeParams extends ApiServerParams {
  group: string
}

/*
 * 移动释放一个节点主要响应内容：
 */
export interface ServiceTaskMoveNodeResult {
  msg?: string
}

export type ServiceTaskMoveNodeConfig = ApiServerApiConfig<
  ServiceTaskMoveNodeParams,
  ServiceTaskMoveNodeResult
>
