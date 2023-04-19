import type { TaskConfigJson, TaskRuntimeConfigJson } from './task-config-json'
import type {
  TaskGroup,
  TaskPriority,
  TaskQueueStatus,
  TaskSuspendCode,
  TaskTaskType,
  TaskWorkerStatus,
} from './task-properties'

/**
 * 任务信息
 *
 */
export interface Task {
  /**
   * 任务 ID
   *
   * @example 2825564
   */
  id: number

  /**
   * 任务名
   *
   * @example 'sf_agg_feature_cpu_1655879881.6876702_1'
   */
  nb_name: string

  /**
   * 提交任务的用户名
   *
   * @example 'hcz'
   */
  user_name: string

  /**
   * 训练任务代码的路径
   *
   */
  code_file: string

  /**
   * 训练任务代码的 workspace
   *
   * @example '/tmp'
   */
  workspace: string

  /**
   * 任务配置
   */
  config_json: TaskConfigJson

  /**
   * 任务所在组
   */
  group: TaskGroup

  /**
   * 任务占用节点数量
   *
   * @example 1
   */
  nodes: number

  /**
   * 任务分配的节点名称
   *
   */
  assigned_nodes: string[]

  /**
   * 重启次数
   *
   * @example 25
   */
  restart_count: number

  /**
   *
   * @example 0
   */
  whole_life_state: number

  /**
   * 整个 chain_id 中最小的 id
   *
   * @example 2708496
   */
  first_id: number

  /**
   * 任务所在环境
   *
   * @example 'cuda_11'
   */
  backend: string

  /**
   * 任务类型
   */
  task_type: TaskTaskType

  /**
   * 排队状态
   */
  queue_status: TaskQueueStatus

  /**
   * 运行时配置 JSON
   */
  runtime_config_json: TaskRuntimeConfigJson

  /**
   *
   * @example ''
   */
  notes: string

  /**
   * 任务优先级
   */
  priority: TaskPriority

  /**
   * @example '06c7f41a-3626-4275-ab43-dfa4270c7d13'
   */
  chain_id: string

  /**
   * 任务退出情况
   *
   * @example 0
   */
  stop_code: number

  /**
   * 任务打断信号
   *
   * @example 0
   *
   */
  suspend_code: TaskSuspendCode

  /**
   * @example 2
   */
  mount_code: number

  /**
   * 最后一次打断时间
   *
   * @example '2022-07-12T10:25:50.505877'
   */
  suspend_updated_at: string

  /**
   * 任务开始时间
   *
   * @example '2022-07-12T10:25:58.461196'
   */
  begin_at: string

  /**
   * 任务结束时间
   *
   * @example '2022-07-12T10:25:58.461196'
   */
  end_at: string

  /**
   * 任务创建时间
   *
   * @example '2022-07-12T10:25:50.505877'
   */
  created_at: string

  /**
   * 任务结束时的 worker 状态
   */
  worker_status: TaskWorkerStatus

  /**
   * 整个 chain_id 的所有 id 列表
   */
  id_list: number[]

  /**
   * 排队状态列表
   */
  queue_status_list: this['queue_status'][]

  /**
   * 整个 chain_id 所有 id 的启动时间列表
   */
  begin_at_list: this['begin_at'][]

  /**
   * 整个 chain_id 所有 id 的结束时间列表
   */
  end_at_list: this['end_at'][]

  /**
   * 整个 chain_id 所有 id 的退出情况列表
   */
  stop_code_list: this['stop_code'][]

  /**
   * 打断信号列表
   */
  suspend_code_list: this['suspend_code'][]

  /**
   * 整个 chain_id 所有 id 的最新 whole_life_state
   */
  whole_life_state_list: this['whole_life_state'][]

  /**
   * 整个 chain_id 所有 id 的任务结束时的 worker 状态
   */
  worker_status_list: this['worker_status'][]

  /**
   * 整个 chain_id 所有 id 的创建时间列表
   */
  created_at_list: this['created_at'][]
}
