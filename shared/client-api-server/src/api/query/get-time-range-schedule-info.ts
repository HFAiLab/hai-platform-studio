import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取过去一段时间内运行任务的统计信息的接口参数
 */
export interface GetTimeRangeScheduleInfoParams extends ApiServerParams {
  /**
   * 开始时间
   */
  start_time: string

  /**
   * 结束时间
   */
  end_time: string
}

export interface TimeRangeScheduleInfoUnit {
  /**
   * 创建数量
   */
  created: number
  /**
   * 完成数量
   */
  finished: number
}

export interface RangeScheduleUnit {
  count: number
  /**
   * 分组，外部用户进行了屏蔽
   */
  group: string
}

export interface RangeInfoDetail {
  created: RangeScheduleUnit[]
  finished: RangeScheduleUnit[]
}

/**
 * 获取过去一段时间内运行任务的统计信息的接口返回结果
 */
export interface GetTimeRangeScheduleInfoResult {
  created: number
  finished: number
  detail: RangeInfoDetail
}

/**
 * 获取过去一段时间内运行任务的统计信息的接口配置
 */
export type GetTimeRangeScheduleInfoApiConfig = ApiServerApiConfig<
  GetTimeRangeScheduleInfoParams,
  GetTimeRangeScheduleInfoResult
>
