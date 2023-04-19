import type {
  TaskChainStatus,
  TaskPriority,
  TaskQueueStatus,
  TaskWorkerStatus,
} from './task-properties'

/**
 * 此文件主要给 bff subscriber 相关调度状态逻辑使用，后续可以对其进行一些命名优化工作
 */
export interface RemoteUserTaskSum {
  user_name: string
  queue_status: TaskQueueStatus
  sum: number
  max_running_seconds: number
}

export declare type RemoteUserTasks = RemoteUserTaskSum[]

// 关于正在调度的实验的一些信息
export interface UserTaskScheduleOverview {
  sum: number
  max_running_seconds: number
}

export interface UserTaskMap {
  [TaskQueueStatus.QUEUED]?: UserTaskScheduleOverview
  [TaskQueueStatus.FINISHED]?: UserTaskScheduleOverview
  [TaskQueueStatus.SCHEDULED]?: UserTaskScheduleOverview
}

export interface UserTasksMap {
  [key: string]: UserTaskMap
}

export interface UserTopTask {
  id: number
  chain_id: string
  nb_name: string
  running_seconds?: number
  created_seconds?: number
  chain_status: TaskChainStatus
  queue_status: TaskQueueStatus
  nodes?: number
  group?: string
  custom_rank: number
  priority: TaskPriority
  worker_status: TaskWorkerStatus
}

export interface SingleUserTopTaskInfo {
  seq: number
  userTopTaskList: UserTopTaskListMap
}

export declare type UserTopTaskListMap = {
  [key in TaskQueueStatus.QUEUED | TaskQueueStatus.SCHEDULED]?: UserTopTask[]
}

export interface CurrentTasksInfo {
  overview: UserTaskMap
  topTasks: SingleUserTopTaskInfo
}

export interface UserTopTaskListMapGroup {
  [key: string]: UserTopTaskListMap
}

export interface RemoteUserTopTaskListMap {
  [TaskQueueStatus.QUEUED]: { [key: string]: UserTopTask[] }
  [TaskQueueStatus.SCHEDULED]: { [key: string]: UserTopTask[] }
  seq: number
}

export interface RemoteTaskOutOfQuota {
  id: number
  nb_name: string
  user_name: string
}

export declare type RemoteTaskOutOfQuotaList = RemoteTaskOutOfQuota[]

export interface OutOfQuotaTask {
  nb_name: string
}

export interface TaskOutOfQuota {
  id: number
  nb_name: string
}

export interface UserTaskOutOfQuotaMapGroup {
  [key: string]: TaskOutOfQuota[]
}
