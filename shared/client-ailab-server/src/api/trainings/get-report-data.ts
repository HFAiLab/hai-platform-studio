import type { DatePeriod, ReportDataResponse, ReportTaskType } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取训练相关的统计指标 的接口参数
 */

export type GetReportDataParams = AilabServerParams
/**
 * 获取训练相关的统计指标 的接口返回结果
 */
export type GetReportDataResult = ReportDataResponse

export interface GetReportDataBody {
  DatePeriod: DatePeriod
  dateType: 'last' | 'certain'
  dateStr?: string
  taskType: ReportTaskType
}

/**
 * 获取训练相关的统计指标 的接口配置
 */
export type GetReportDataApiConfig = AilabServerApiConfig<
  GetReportDataParams,
  GetReportDataResult,
  GetReportDataBody
>
