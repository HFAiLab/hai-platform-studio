import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 更新任务优先级（目前用于拖拽需求）接口参数
 */
export type UpdatePriorityApiParams = ChainTaskRequestInfo &
  ApiServerParams & {
    priority?: number
    custom_rank?: number
  }

/**
 * 更新任务优先级（目前用于拖拽需求）接口返回结果
 */
export interface UpdatePriorityApiResult {
  msg: string

  /**
   * 操作成功的时间戳，可以用于保序
   */
  timestamp: number
}

/**
 * 更新任务优先级（目前用于拖拽需求）接口配置
 */
export type UpdatePriorityApiApiConfig = ApiServerApiConfig<
  UpdatePriorityApiParams,
  UpdatePriorityApiResult
>
