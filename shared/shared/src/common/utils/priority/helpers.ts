import { TaskPriority } from '../../types'
import { TASK_PRIORITIES_STANDARD, TASK_PRIORITY_NAMES_STANDARD, taskPriorityNameMap } from './defs'
import type {
  TaskPriorityDeprecated,
  TaskPriorityName,
  TaskPriorityNameDeprecated,
  TaskPriorityNameStandard,
  TaskPriorityStandard,
} from './defs'

/**
 * 将优先级数值转换为优先级名称字符串
 *
 * 极少数情况下可能会存在非标准的优先级数值，此时 fallback 为 UNKNOWN
 */
export const priorityToName = (priority: TaskPriority): TaskPriorityName =>
  taskPriorityNameMap[priority] ?? `UNKNOWN_${priority}`

/**
 * 将 priority 转成 number
 */
export const priorityToNumber = (priorityName: string): number => {
  if (priorityName in TaskPriority) {
    return (TaskPriority as unknown as Record<string, number>)[priorityName] as number
  }
  return -2
}

/**
 * 是否是已废弃的优先级
 */
export const isDeprecatedPriority = (priority: TaskPriority): priority is TaskPriorityDeprecated =>
  !TASK_PRIORITIES_STANDARD.includes(priority as TaskPriorityStandard)

/**
 * 是否是已废弃的优先级名称
 */
export const isDeprecatedPriorityName = (
  priorityName: TaskPriorityName,
): priorityName is TaskPriorityNameDeprecated =>
  !TASK_PRIORITY_NAMES_STANDARD.includes(priorityName as TaskPriorityNameStandard)
