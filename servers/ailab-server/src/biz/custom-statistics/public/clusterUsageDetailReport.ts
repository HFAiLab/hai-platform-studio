/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** *
 * 性能数据获取
 */
import fs from 'fs'
import { DatePeriod } from '@hai-platform/shared'
import type { ReportData, ReportTaskType } from '@hai-platform/shared'

abstract class ReportConsumer {
  abstract getDiskPath(type: ReportTaskType, dateStr: string): string

  async readFromDisk(type: ReportTaskType, dateStr: string) {
    const distPath = this.getDiskPath(type, dateStr)
    const jsonStr = await fs.promises.readFile(distPath, { encoding: 'utf-8' })
    const data = JSON.parse(jsonStr)
    return data
  }
}

interface MemoryDataConfig {
  deleteCacheInterval?: number
  maxCacheForDays?: number
}

export interface CommonReportConsumerConfig {
  DatePeriod: DatePeriod
  cacheConfig: MemoryDataConfig
}

/**
 *
 * 消费者，实时、日、周、月
 *
 */
class CommonReportConsumer extends ReportConsumer {
  requestInfo: { dayTag: string; hour: number } | null = null

  DatePeriod: DatePeriod

  constructor(config: CommonReportConsumerConfig) {
    super()
    this.DatePeriod = config.DatePeriod
  }

  getDiskPath(type: ReportTaskType, dateStr: string) {
    return ``
  }

  async getDataFromDisk(type: ReportTaskType, dateStr: string) {
    return {
      performance: {},
      tasks: {},
      ranks: {},
      topRanks: [],
    }
  }

  /**
   * 日：2022-04-22
   * 周：2022-04-22
   * 月：2022-04
   */
  async getData(type: ReportTaskType, dateStr: string, name: string): Promise<ReportData> {
    // 这里补充实际的业务逻辑
    return {
      performance: {
        gpu_rate: 0,
        gpu_power: 0,
        gpu_p2u: 0,
        gpu_hours: 0,
        gpu_occupied_percent: 0,
        ib_usage: 0,
        cpu_rate: 0,
        mem_usage: 0,
      },
      ranks: {
        rank: 0,
        gpu_rate: 0,
        gpu_hours: 0,
        gpu_power: 0,
        gpu_p2u: 0,
      },
      tasks: {
        chain_task_count: 0,
        extreme_high_percent: 0,
        interrupt_task_count: 0,
        interrupt_task_median: 0,
        short_task_count: 0,
        fail_rate: 0,
        exec_time_mean: 0,
        exec_time_median: 0,
        exec_true_ratio: 0,
        task_wait_mean: 0,
        task_wait_median: 0,
        invalid_task_count: 0,
      },
      topRanks: [],
    } as ReportData
  }

  async getDataList(type: ReportTaskType, dateStrList: string[], name: string) {
    return []
  }
}

export const RealtimeReportConsumerInstance = new CommonReportConsumer({
  DatePeriod: DatePeriod.realtime,
  cacheConfig: {
    maxCacheForDays: 2,
  },
})

export const DailyReportConsumerInstance = new CommonReportConsumer({
  DatePeriod: DatePeriod.daily,
  cacheConfig: {
    maxCacheForDays: 22,
  },
})

export const WeeklyReportConsumerInstance = new CommonReportConsumer({
  DatePeriod: DatePeriod.weekly,
  cacheConfig: {
    maxCacheForDays: 22 * 7,
  },
})

export const MonthlyReportConsumerInstance = new CommonReportConsumer({
  DatePeriod: DatePeriod.monthly,
  cacheConfig: {
    maxCacheForDays: 22 * 7 * 30,
  },
})

export const GetReportConsumerInstance = (datePeriod: DatePeriod) => {
  if (datePeriod === DatePeriod.daily) return DailyReportConsumerInstance
  if (datePeriod === DatePeriod.weekly) return WeeklyReportConsumerInstance
  if (datePeriod === DatePeriod.monthly) return MonthlyReportConsumerInstance
  if (datePeriod === DatePeriod.realtime) return RealtimeReportConsumerInstance
  throw new Error('not implement')
}
