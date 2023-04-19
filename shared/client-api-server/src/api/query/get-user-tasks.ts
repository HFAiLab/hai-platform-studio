import type {
  ExtendedTask,
  TaskQueueStatus,
  TaskTaskType,
  TaskWorkerStatus,
} from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 查询当前用户任务的接口参数
 */
export interface GetUserTasksParams extends ApiServerParams {
  /**
   * 页数
   */
  page: number

  /**
   * 每页长度
   */
  page_size: number

  /**
   * 任务类型
   */
  task_type?: TaskTaskType[]

  /**
   * 任务名称查询字符串
   */
  nb_name_pattern?: string

  /**
   * 任务结束时的状态
   */
  worker_status?: TaskWorkerStatus[]

  /**
   * 任务排队状态
   */
  queue_status?: TaskQueueStatus[]

  /**
   * 任务标签
   */
  tag?: string[]

  /**
   * 排除掉带指定标签的任务
   */
  excluded_tag?: string[]

  /**
   * 创建实验的开始时间区间选择：起始，必须和 created_end_time 同时存在或者不存在
   */
  created_start_time?: string

  /**
   * 创建实验的开始时间区间选择：结束，必须和 created_start_time 同时存在或者不存在
   */
  created_end_time?: string

  /**
   * 根据分组查询实验
   */
  group?: string[]
}

/**
 * 查询当前用户任务的接口返回结果
 */
export interface GetUserTasksResult {
  /**
   * 查询到的任务总数
   */
  total: number

  /**
   * 当前分页的任务列表
   */
  tasks: ExtendedTask[]
}

/**
 * 查询当前用户任务的接口配置
 */
export type GetUserTasksApiConfig = ApiServerApiConfig<GetUserTasksParams, GetUserTasksResult>
