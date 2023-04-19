import type { Pod } from '../pod'
import type { User } from '../user'
import type { BuiltinServiceResponse, CustomServiceResponse } from './service'
import type { Task } from './task'
import type {
  ContainerTaskRuntimeConfigJson,
  TaskConfigJsonJupyter,
  TaskConfigJsonTraining,
} from './task-config-json'
import type { ContainerTaskStatus, TaskChainStatus } from './task-properties'

/**
 * 扩展的任务类型
 */
export interface ExtendedTask extends Task {
  /**
   * 用户打的任务标签
   */
  tags: string[]

  /**
   * 用户是否收藏了该任务
   */
  star: boolean

  /**
   * 任务分配的 Pod
   */
  _pods_: Pod[]
}

/**
 * Jupyter 任务类型
 */
export interface JupyterTask extends ExtendedTask {
  /**
   * 将任务配置指定为 Jupyter 任务的配置类型
   */
  config_json: TaskConfigJsonJupyter
}

/**
 * Container 任务类型，实际上是对 Jupyter 任务类型的一个补充，JupyterTask 应该不怎么用了
 */
export interface ContainerTask extends ExtendedTask {
  builtin_services: BuiltinServiceResponse[]

  custom_services: CustomServiceResponse[]

  status: ContainerTaskStatus

  last_checkpoint: any

  name: string

  config_json: TaskConfigJsonJupyter

  /**
   * 这里目前的做法是一个覆盖
   */
  runtime_config_json: ContainerTaskRuntimeConfigJson
}

/**
 * Container 任务类型，这个是给管理员用的，所以多了比如 token 等字段
 */
export interface ContainerTaskByAdmin extends ContainerTask {
  token: string
}

/**
 * 训练任务类型
 */
export interface TrainingTask extends ExtendedTask {
  /**
   * 将任务配置指定为训练任务的配置类型
   */
  config_json: TaskConfigJsonTraining
}

/**
 * 运行中的任务类型
 *
 * 只返回了任务的部分字段，并添加了一些额外字段
 */
export interface RunningTask
  extends Pick<
    Task,
    | 'id'
    | 'nb_name'
    | 'user_name'
    | 'config_json'
    | 'group'
    | 'nodes'
    | 'assigned_nodes'
    | 'backend'
    | 'task_type'
    | 'queue_status'
    | 'priority'
    | 'chain_id'
    | 'begin_at'
    | 'created_at'
    | 'first_id'
    | 'runtime_config_json'
  > {
  /**
   * 任务用户对应的角色
   */
  user_role: User['role']

  /**
   * 实验状态
   */
  chain_status: TaskChainStatus
}

/**
 * 查询一段时间中运行的所有历史任务
 *
 * 可能有还在运行中的任务
 */
export interface HistoryTask
  extends Pick<
    Task,
    | 'id'
    | 'nb_name'
    | 'user_name'
    | 'code_file'
    | 'workspace'
    | 'config_json'
    | 'group'
    | 'nodes'
    | 'assigned_nodes'
    | 'restart_count'
    | 'whole_life_state'
    | 'first_id'
    | 'backend'
    | 'task_type'
    | 'queue_status'
    | 'priority'
    | 'chain_id'
    | 'stop_code'
    | 'suspend_code'
    | 'mount_code'
    | 'suspend_updated_at'
    | 'begin_at'
    | 'end_at'
    | 'created_at'
    | 'worker_status'
  > {
  /**
   * 是否是 chain 中的最后一个任务
   */
  last_task: boolean
  /**
   * 提交任务时的分区信息
   */
  schedule_zone: string | null
}
