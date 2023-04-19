import type { DatePeriod, ReportDataResponse, ReportTaskType } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取指定用户的萤火报表多天数据的接口参数
 */
export type GetYinghuoStatsByUserParams = AilabServerParams

/**
 * 获取指定用户的萤火报表多天数据返回结果
 */
export type GetYinghuoStatsByUserResult = ReportDataResponse[]

export interface GetYinghuoStatsByUserBody {
  type: ReportTaskType
  range: DatePeriod
  dateStr: string
  targetUser: string
  count: number
}

/**
 * 获取指定用户的萤火报表多天数据接口配置
 */
export type GetYinghuoStatsByUserApiConfig = AilabServerApiConfig<
  GetYinghuoStatsByUserParams,
  GetYinghuoStatsByUserResult,
  GetYinghuoStatsByUserBody
>
