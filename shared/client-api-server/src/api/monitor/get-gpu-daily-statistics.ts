import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取 GPU 每日统计数据的接口参数
 */
export type GetGpuDailyStatisticsParams = ApiServerParams

/**
 * 获取 GPU 每日统计数据的接口返回结果
 */
export type GetGpuDailyStatisticsResult = [
  // 日期 YYYYMMDD
  date: string,
  // GPU 占用率
  gpuUsage: string,
  // GPU 使用率
  gpuEffectiveUsage: string,
  // GPU 效率（使用率 / 占用率）
  gpuEfficiency: string,
]

/**
 * 获取 GPU 每日统计数据的接口配置
 */
export type GetGpuDailyStatisticsApiConfig = ApiServerApiConfig<
  GetGpuDailyStatisticsParams,
  GetGpuDailyStatisticsResult
>
