import type { DatePeriod, ReportDataResponse, ReportTaskType } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取训练相关的统计指标列表（一段时间内）的接口参数
 */
export interface GetReportDataListParams extends AilabServerParams {
  DatePeriod: DatePeriod
  dateType: 'last' | 'certain'
  dateStr?: string
  taskType: ReportTaskType
}

/**
 * 获取训练相关的统计指标列表（一段时间内）的接口返回结果
 */
export type GetReportDataListResult = ReportDataResponse[]

export interface GetReportDataListBody {
  DatePeriod: DatePeriod
  dateType: 'last_n' | 'certain'
  dateCount?: number
  dateStrList?: string[]
  taskType: ReportTaskType
}

/**
 * 获取训练相关的统计指标列表（一段时间内）的接口配置
 */
export type GetReportDataListApiConfig = AilabServerApiConfig<
  GetReportDataListParams,
  GetReportDataListResult,
  GetReportDataListBody
>
