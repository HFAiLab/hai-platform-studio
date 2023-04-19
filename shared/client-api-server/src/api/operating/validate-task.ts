import type { HttpRequestConfig } from '@hai-platform/request-client'
import type { ExtendedTask } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * Validate 实验的最新版本请求参数：
 */
export interface ValidateTaskParams extends ApiServerParams {
  /**
   * 任务 chain_id，和 id 二选一 (其实还有 nb_name)
   */
  chain_id?: string
  /**
   * 任务 id，和 chain_id 二选一
   */
  id?: number
  /**
   * 要 validate 的节点 rank 编号，0 开始
   */
  ranks: number[]
  /**
   * validate 需要的 file，
   */
  file?: string
}

/*
 * Validate 实验的主要响应内容：
 */
export type ValidateTaskResult = {
  created: boolean

  msg: string

  task: ExtendedTask
}

export type ValidateTaskConfig = ApiServerApiConfig<ValidateTaskParams, ValidateTaskResult>

export const ValidateTaskRequestConfigHandler = (config: HttpRequestConfig): HttpRequestConfig => {
  if (!config.params) {
    config.params = {}
  }

  config.params.file = config.params.file || '/marsv2/scripts/validation/zhw_validate.py'
  config.params.chosen_ranks = (config.params.ranks || []).length
    ? config.params.ranks.join(',')
    : 'all'

  return config
}
