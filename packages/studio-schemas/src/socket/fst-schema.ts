import type { TaskLogRestartLogMap } from '@hai-platform/client-api-server'
import type { ExtendedTask } from '@hai-platform/shared'
import type { IChainObj } from '../model/Chain'

export interface TaskOverview {
  scheduled: number
  queued: number
}

export type ExperimentsRespContent = [number, IChainObj[]]
export interface ClusterOverviewRespContent {
  free?: number
  locked?: number
  not_ready?: number
  usage_rate: number
  working?: number
}

export interface ClusterOverviewDetail {
  usage_rate: number
  total: number
  other: number
  free: number
  working: number
}

export enum LogErrors {
  LookUpChainFailed = '<BFF_ERR>LookUpChainFailed',
  RankOutOfRange = '<BFF_ERR>RankOutOfRange',
  GetLogFailed = '<BFF_ERR>GetLogFailed',
}

export interface LogLastSeen {
  timestamp: string
  offset: number
  mtime: number
}

export interface LogRespContent {
  success: number
  msg?: LogErrors | string
  chain?: ExtendedTask
  error_msg?: string
  data?: string
  fullLog?: string
  stop_code?: string | number
  restart_log?: TaskLogRestartLogMap
  last_seen?: LogLastSeen
}

export interface SysLogRespContent {
  success: number
  data?: string
  msg?: string
}
