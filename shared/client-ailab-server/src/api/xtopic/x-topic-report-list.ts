import type { XTopicReportSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取举报列表 的接口参数
 */
export type XTopicReportListParams = AilabServerParams

/**
 * 获取举报列表 的接口参数
 */
export interface XTopicReportListResult {
  count: number

  rows: XTopicReportSchema[]
}

export type XTopicReportListConfig = AilabServerApiConfig<
  XTopicReportListParams,
  XTopicReportListResult
>
