/* eslint-disable @typescript-eslint/naming-convention */
/**
 * studio 扩展的一些 priority schema
 */

import type { TaskPriorityNameStandard } from '@hai-platform/shared'
import { TaskPriority, TaskPriorityName } from '@hai-platform/shared'

export const InnerPriorityValues = [
  TaskPriority.ABOVE_NORMAL,
  TaskPriority.HIGH,
  TaskPriority.VERY_HIGH,
  TaskPriority.EXTREME_HIGH,
]
export const OuterPriorityValues = [TaskPriority.AUTO]

interface PrioritySubmitListItem {
  name: string
  value: number
  invalid: boolean
}

export const SUBMIT_PRIORITY_LIST: PrioritySubmitListItem[] = [
  { name: TaskPriorityName.EXTREME_HIGH, value: TaskPriority.EXTREME_HIGH, invalid: false },
  { name: TaskPriorityName.VERY_HIGH, value: TaskPriority.VERY_HIGH, invalid: false },
  { name: TaskPriorityName.HIGH, value: TaskPriority.HIGH, invalid: false },
  { name: TaskPriorityName.ABOVE_NORMAL, value: TaskPriority.ABOVE_NORMAL, invalid: false },
  { name: TaskPriorityName.AUTO, value: TaskPriority.AUTO, invalid: false },
]

export interface IPriorityItem {
  priority: TaskPriorityNameStandard
  used: number | string
  total: number | string
  limit?: number | string
}

// 下面的主要是 admin 模块在用
// -----------------

export const PRIORITY_MAP = {
  '-1': 'AUTO',
  '0': 'LOW',
  '5': 'BELOW_NORMAL',
  '10': 'NORMAL',
  '20': 'ABOVE_NORMAL',
  '30': 'HIGH',
  '40': 'VERY_HIGH',
  '50': 'EXTREME_HIGH',
}

export type PRIORITY_VALUE_STRING = keyof typeof PRIORITY_MAP

export function priorityVtoS(v: PRIORITY_VALUE_STRING | number) {
  return PRIORITY_MAP[v as PRIORITY_VALUE_STRING] ?? null
}
// -----------------
