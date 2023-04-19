import { TaskPriority } from '../../types'

/**
 * 任务优先级名称
 */
export enum TaskPriorityName {
  /**
   * 一般给外部用户使用
   *
   * @value -1
   */
  AUTO = 'AUTO',

  /**
   * 已弃用，在 NORMAL 配额满时还会被调度到
   *
   * @value 0
   * @deprecated
   */
  LOW = 'LOW',

  /**
   * 已弃用，还会被手动调度到
   *
   * @value 5
   * @deprecated
   */
  BELOW_NORMAL = 'BELOW_NORMAL',

  /**
   * 已弃用，在 ABOVE_NORMAL 配额满时还会被调度到
   *
   * @value 10
   * @deprecated
   */
  NORMAL = 'NORMAL',

  /**
   * @value 20
   */
  ABOVE_NORMAL = 'ABOVE_NORMAL',

  /**
   * @value 30
   */
  HIGH = 'HIGH',

  /**
   * @value 40
   */
  VERY_HIGH = 'VERY_HIGH',

  /**
   * @value 50
   */
  EXTREME_HIGH = 'EXTREME_HIGH',
}

/**
 * 任务优先级数值 -> 名称
 */
export const taskPriorityNameMap: Record<TaskPriority, TaskPriorityName> = {
  [TaskPriority.AUTO]: TaskPriorityName.AUTO,
  [TaskPriority.LOW]: TaskPriorityName.LOW,
  [TaskPriority.BELOW_NORMAL]: TaskPriorityName.BELOW_NORMAL,
  [TaskPriority.NORMAL]: TaskPriorityName.NORMAL,
  [TaskPriority.ABOVE_NORMAL]: TaskPriorityName.ABOVE_NORMAL,
  [TaskPriority.HIGH]: TaskPriorityName.HIGH,
  [TaskPriority.VERY_HIGH]: TaskPriorityName.VERY_HIGH,
  [TaskPriority.EXTREME_HIGH]: TaskPriorityName.EXTREME_HIGH,
}

/**
 * 标准的优先级
 */
export const TASK_PRIORITIES_STANDARD = [
  TaskPriority.AUTO,
  TaskPriority.ABOVE_NORMAL,
  TaskPriority.HIGH,
  TaskPriority.VERY_HIGH,
  TaskPriority.EXTREME_HIGH,
] as const

/**
 * 逐步弃用的优先级
 */
export const TASK_PRIORITIES_DEPRECATED = [
  TaskPriority.LOW,
  TaskPriority.BELOW_NORMAL,
  TaskPriority.NORMAL,
] as const

/**
 * 全部优先级
 */
export const TASK_PRIORITIES_ALL = [
  ...TASK_PRIORITIES_STANDARD,
  ...TASK_PRIORITIES_DEPRECATED,
] as const

/**
 * 标准的优先级名称
 */
export const TASK_PRIORITY_NAMES_STANDARD = [
  TaskPriorityName.AUTO,
  TaskPriorityName.ABOVE_NORMAL,
  TaskPriorityName.HIGH,
  TaskPriorityName.VERY_HIGH,
  TaskPriorityName.EXTREME_HIGH,
] as const

/**
 * 逐步弃用的优先级名称
 */
export const TASK_PRIORITY_NAMES_DEPRECATED = [
  TaskPriorityName.LOW,
  TaskPriorityName.BELOW_NORMAL,
  TaskPriorityName.NORMAL,
] as const

/**
 * 全部优先级名称
 */
export const TASK_PRIORITY_NAMES_ALL = [
  ...TASK_PRIORITY_NAMES_STANDARD,
  ...TASK_PRIORITY_NAMES_DEPRECATED,
] as const

/**
 * 标准的优先级类型
 */
export type TaskPriorityStandard = (typeof TASK_PRIORITIES_STANDARD)[number]

/**
 * 逐步弃用的优先级类型
 */
export type TaskPriorityDeprecated = (typeof TASK_PRIORITIES_DEPRECATED)[number]

/**
 * 标准的优先级名称类型
 */
export type TaskPriorityNameStandard = (typeof TASK_PRIORITY_NAMES_STANDARD)[number]

/**
 * 逐步弃用的优先级名称类型
 */
export type TaskPriorityNameDeprecated = (typeof TASK_PRIORITY_NAMES_DEPRECATED)[number]
