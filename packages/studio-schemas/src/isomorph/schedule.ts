import type { QueueStatus } from './common'

export interface CurrentScheduleTotalInfo {
  scheduled: number
  queued: number
}

export interface ScheduleTypedInfo {
  priority: number
  queue_status: QueueStatus.scheduled | QueueStatus.queued
  count: number
  user_role: 'internal' | 'external'
}

export interface CurrentScheduleTotalTypedInfo {
  [key: string]: ScheduleTypedInfo[]
}
