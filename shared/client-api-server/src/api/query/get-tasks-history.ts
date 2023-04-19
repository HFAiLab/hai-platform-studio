import type { HistoryTask } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export interface GetTasksHistoryParams extends ApiServerParams {
  /**
   * 开始时间
   */
  start: string

  /**
   * 结束时间
   */
  end: string

  /**
   * 最多取任务个数上限
   * 默认是 500 个
   */
  limit?: number
}

export type GetTasksHistoryResult = HistoryTask[]

export type GetTasksHistoryApiConfig = ApiServerApiConfig<
  GetTasksHistoryParams,
  GetTasksHistoryResult
>
