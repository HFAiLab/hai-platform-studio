import {
  TASK_PRIORITIES_ALL,
  TASK_PRIORITIES_STANDARD,
  TASK_PRIORITY_NAMES_ALL,
  TASK_PRIORITY_NAMES_STANDARD,
  TaskPriority,
  TaskPriorityName,
  TaskQueueStatus,
  TaskTaskType,
  UserRole,
  isGPUGroup,
  priorityToName,
} from '@hai-platform/shared'
import type {
  RunningTask,
  TaskConfigJsonTraining,
  TaskPriorityNameDeprecated,
} from '@hai-platform/shared'
import type { OPTION_VALUE_ALL } from '@/constants'
import { TaskTrainingType } from '@/constants'
import { dayjs } from '@/utils'
import { getNodesDataByNames } from './nodes'
import type { Node, NodesDataItem, NodesNameMap } from './nodes'

export {
  TASK_PRIORITIES_ALL,
  TASK_PRIORITIES_STANDARD,
  TASK_PRIORITY_NAMES_ALL,
  TASK_PRIORITY_NAMES_STANDARD,
  TaskPriority,
  TaskPriorityName,
  TaskTrainingType,
}
export type { RunningTask, TaskPriorityNameDeprecated }
export type TaskScheduleZone = Node['schedule_zone'] | null

/**
 * 任务排队情况展示的训练类型
 */
export type TasksQueueTrainingType = TaskTrainingType | typeof OPTION_VALUE_ALL

/**
 * 判断一个任务是否是 Jupyter 任务
 */
export const isJupyterTask = (task: RunningTask): boolean =>
  task.task_type === TaskTaskType.JUPYTER_TASK

/**
 * 判断一个任务是否是训练任务
 */
export const isTrainingTask = (task: RunningTask): boolean =>
  task.task_type === TaskTaskType.TRAINING_TASK

/**
 * 判断一个任务是否是在排队中的任务
 */
export const isQueuedTask = (task: RunningTask): boolean =>
  task.queue_status === TaskQueueStatus.QUEUED

/**
 * 获取任务的训练类型
 *
 * 目前没有专门的字段表示，所以需要根据任务分组进行判断
 */
export const getTaskTrainingType = (task: RunningTask): TaskTrainingType => {
  const client_group: string =
    (task.config_json?.client_group as string) ??
    (task.config_json as TaskConfigJsonTraining)?.schema?.resource.group ??
    task.group // 兜底
  if (client_group && isGPUGroup(client_group)) {
    return TaskTrainingType.GPU
  }
  return TaskTrainingType.CPU
}

/**
 * 判断一个任务是否是 GPU 任务
 */
export const isGPUTask = (task: RunningTask): boolean =>
  getTaskTrainingType(task) === TaskTrainingType.GPU

/**
 * 判断一个任务是否是 CPU 任务
 */
export const isCPUTask = (task: RunningTask): boolean =>
  getTaskTrainingType(task) === TaskTrainingType.CPU

/**
 * 判断一个任务是否是内部用户运行
 */
export const isInternalUserTask = (task: RunningTask): boolean =>
  task.user_role === UserRole.INTERNAL

/**
 * 判断一个任务是否是外部用户运行
 */
export const isExternalUserTask = (task: RunningTask): boolean =>
  task.user_role === UserRole.EXTERNAL
/**
 * 获取任务分配的区域
 *
 * 目前没有专门的字段表示，所以需要根据任务分配的节点所在的区域进行判断
 */
export const getTaskScheduleZone = (
  task: RunningTask,
  { nodesNameMap }: { nodesNameMap: NodesNameMap },
): TaskScheduleZone => {
  const nodeName = task.assigned_nodes[0]
  if (!nodeName) return task.config_json.schedule_zone as TaskScheduleZone
  const node = nodesNameMap[nodeName]
  if (!node) return task.config_json.schedule_zone as TaskScheduleZone
  return node.schedule_zone
}

export const getAutoPriority = (task: RunningTask): number | null => {
  const configPriorities = task.runtime_config_json.running_priority
  if (!configPriorities) return null
  const lastConfigPriority = configPriorities[configPriorities.length - 1]
  return lastConfigPriority ? lastConfigPriority.priority : null
}

/**
 * 获取 Jupyter 任务列表
 */
export const getJupyterTasks = (tasks: RunningTask[]): RunningTask[] =>
  tasks.filter((item) => isJupyterTask(item))

/**
 * 获取非 Jupyter 任务列表
 */
export const getNonJupyterTasks = (tasks: RunningTask[]): RunningTask[] =>
  tasks.filter((item) => !isJupyterTask(item))

/**
 * 任务数据元素
 *
 * 在运行中的任务信息基础上，添加了分配节点、调度区域等数据
 */
export interface TasksDataItem extends RunningTask {
  /**
   * 优先级名称
   */
  priorityName: TaskPriorityName

  /**
   * 占用的节点列表
   *
   * 由于 nodes 字段被占用，所以改用不太一致的 nodesList 命名
   */
  nodesList: NodesDataItem[]

  /**
   * 任务调度区域
   *
   * 没有直接对应的字段，根据任务分配的节点的调度区域来判断
   */
  scheduleZone: TaskScheduleZone

  /**
   * 任务训练类型
   */
  trainingType: TaskTrainingType

  /**
   * 任务为 AUTO 时的真实优先级
   */
  autoPriority: number | null

  /**
   * 任务为 AUTO 时的真实优先级名称
   */
  autoPriorityName: TaskPriorityName | null

  /**
   * 任务创建时间
   */
  createdAt: dayjs.Dayjs

  /**
   * 任务开始时间
   */
  beginAt: dayjs.Dayjs

  /**
   * 提交任务时用户原始真实选择的分组，带后缀分区等信息
   */
  client_group: string

  /**
   * 排序顺序
   */
  first_id: number
}

/**
 * 获取任务数据元素
 */
export const getTasksDataItem = (
  task: RunningTask,
  {
    nodesNameMap,
  }: {
    nodesNameMap: NodesNameMap
  },
): TasksDataItem => ({
  ...task,
  priorityName: priorityToName(task.priority),
  // 排队中的任务也可能会有 assigned_nodes，但当前并未占用
  nodesList: isQueuedTask(task) ? [] : getNodesDataByNames(task.assigned_nodes, { nodesNameMap }),
  scheduleZone: getTaskScheduleZone(task, { nodesNameMap }),
  trainingType: getTaskTrainingType(task),
  autoPriority: getAutoPriority(task),
  autoPriorityName: getAutoPriority(task) !== null ? priorityToName(getAutoPriority(task)!) : null,
  createdAt: dayjs(task.created_at),
  beginAt: dayjs(task.begin_at),
  first_id: task.runtime_config_json.runtime_priority?.custom_rank || task.first_id,
  client_group: task.config_json.client_group as string,
})

/**
 * 获取任务数据
 */
export const getTasksData = (
  tasks: RunningTask[],
  {
    nodesNameMap,
  }: {
    nodesNameMap: NodesNameMap
  },
): TasksDataItem[] => tasks.map((item) => getTasksDataItem(item, { nodesNameMap }))
