import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { DatasetJobMeta } from './schema'

// GetRunningJobProgress
export type DatasetGetRunningJobProgressParams = AilabServerParams

interface SummaryItem {
  dataset: string
  begin: string
  type: DatasetJobMeta['taskType']
  downloadedBytes?: number
  totalBytes?: number
}

/*
 * 获取所有运行中的任务的情况，包括 oss 下载进度
 */
export type DatasetGetRunningJobProgressResult = SummaryItem[]

export type DatasetGetRunningJobProgressConfig = AilabServerApiConfig<
  DatasetGetRunningJobProgressParams,
  DatasetGetRunningJobProgressResult
>
