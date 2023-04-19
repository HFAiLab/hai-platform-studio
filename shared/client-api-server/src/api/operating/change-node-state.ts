import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * [管理员接口] 禁用 / 恢复节点
 */
export interface ChangeNodeStateParams extends ApiServerParams {
  node_name: string
  state: 'enabled' | 'disabled'
}

export interface ChangeNodeStateResult {
  msg?: string
}

export type ChangeNodeStateConfig = ApiServerApiConfig<ChangeNodeStateParams, ChangeNodeStateResult>
