import type { PodRole, PodStatus } from './pod-properties'

/**
 * Pod 信息
 *
 */
export interface Pod {
  /**
   * 任务 ID
   */
  task_id: number

  /**
   * Pod ID
   */
  pod_id: string

  /**
   * Job ID
   */
  job_id: number

  /**
   * Pod 状态
   */
  status: PodStatus

  /**
   * 节点名称
   */
  node: string

  /**
   * Pod 角色
   */
  role: PodRole

  /**
   * 内存限制，单位 bytes
   *
   * @example 472171302912
   */
  memory: number

  /**
   * cpu 限制
   *
   * @example 118
   */
  cpu: number

  /**
   * 分配的 gpu 编号
   *
   * @example [0, 1, 2, 3, 4, 5, 6, 7]
   */
  assigned_gpus: number[]

  /**
   * 错误码
   */
  exit_code: 'nan' | string

  /**
   * Pod 记录的创建时间
   *
   * @example '2022-06-07T12:27:08.010154'
   */
  created_at: string

  /**
   * pod 变为 building 的时间
   *
   * @example '2022-06-07T12:27:08.010154'
   */
  begin_at: string

  /**
   * pod 结束的时间
   *
   * @example '2022-06-07T12:27:08.010154'
   */
  end_at: string
}
