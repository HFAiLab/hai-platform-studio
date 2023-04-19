import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { DatasetItem, DatasetJob } from './schema'

export enum StageStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  FAILED = 'failed',
}

export type ActionStatus = {
  enabled: boolean
  msg?: string
}

export type DatasetSyncStages = Record<
  string,
  {
    name: string
    status: StageStatus
    actionStatus: ActionStatus
  }
>
export type DatasetMemo = {
  datasetId: string
  user: string
  memo: string
  createdAt: string
}

export type DatasetEventLogs = {
  datasetId: string
  user: string
  message: string
  createdAt: string
}

export type PathTemplate = Record<
  'weka' | '3fs' | 'temp' | 'none',
  {
    host: string
    display: string
  }
>

/*
 * 获取同步信息，公共数据集只返回 DatasetItem 本体，私有数据集额外返回 stage 状态，日志等信息
 */

export type DatasetGetSyncInfoParams = AilabServerParams
export type DatasetGetSyncInfoBody = {
  id: string
}

export type DatasetGetSyncInfoResult = {
  dataset: DatasetItem
  info?: {
    stages: DatasetSyncStages
    memos: DatasetMemo[]
    eventLogs: DatasetEventLogs[]
    jobs: DatasetJob[]
    clusterPathTemplate: PathTemplate
  }
}

export type DatasetGetSyncInfoConfig = AilabServerApiConfig<
  DatasetGetSyncInfoParams,
  DatasetGetSyncInfoResult,
  DatasetGetSyncInfoBody
>
