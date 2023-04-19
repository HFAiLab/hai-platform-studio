import { i18n, i18nKeys } from '@hai-platform/i18n'

export enum StatisticRange {
  D1 = '1d',
  D7 = '7d',
  D30 = '30d',
  D60 = '60d',
  D90 = '90d',
}
export enum ChartType {
  AverageGPUUsage = 'AverageGPUUsage',
}

export interface SummaryMetrics {
  totalGPUHour: number
  totalTaskFinished: number
  totalAvgGPUUtil: number
  timestamp: number
}

export enum DatePeriod {
  realtime = 'realtime',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}

export enum MetricTypes {
  // performance
  cpu_rate = 'cpu_rate',
  gpu_hours = 'gpu_hours',
  gpu_power = 'gpu_power',
  gpu_p2u = 'gpu_p2u',
  gpu_rate = 'gpu_rate',
  gpu_occupied_percent = 'gpu_occupied_percent',
  ib_usage = 'ib_usage',
  mem_usage = 'mem_usage',
  // tasks
  chain_task_count = 'chain_task_count',
  exec_time_mean = 'exec_time_mean',
  exec_time_median = 'exec_time_median',
  exec_true_ratio = 'exec_true_ratio',
  extreme_high_percent = 'extreme_high_percent',
  fail_rate = 'fail_rate',
  interrupt_task_count = 'interrupt_task_count',
  interrupt_task_median = 'interrupt_task_median',
  invalid_task_count = 'invalid_task_count',
  short_task_count = 'short_task_count',
  task_wait_mean = 'task_wait_mean',
  task_wait_median = 'task_wait_median',
}
export const MetricMeta = () => {
  return {
    [MetricTypes.gpu_hours]: { title: i18n.t(i18nKeys.biz_perf_gpu_hours), unit: 'h', fixed: 1 },
    [MetricTypes.cpu_rate]: { title: i18n.t(i18nKeys.biz_perf_cpu_rate), unit: '%', fixed: 2 },
    [MetricTypes.gpu_power]: { title: i18n.t(i18nKeys.biz_perf_gpu_power), unit: 'W', fixed: 2 },
    [MetricTypes.gpu_rate]: { title: i18n.t(i18nKeys.biz_perf_gpu_rate), unit: '%', fixed: 2 },
    [MetricTypes.gpu_p2u]: {
      title: i18n.t(i18nKeys.biz_perf_gpu_power_to_util),
      unit: '%',
      fixed: 2,
    },
    [MetricTypes.ib_usage]: { title: i18n.t(i18nKeys.biz_perf_ib_usage), unit: 'MiB/s', fixed: 2 },
    [MetricTypes.mem_usage]: { title: i18n.t(i18nKeys.biz_perf_mem_usage), unit: 'GiB', fixed: 2 },
    // task
    [MetricTypes.chain_task_count]: {
      title: i18n.t(i18nKeys.biz_perf_already_sub_trainings),
      unit: '',
      fixed: 0,
    },
    [MetricTypes.exec_time_mean]: {
      title: i18n.t(i18nKeys.biz_perf_exec_time_mean),
      unit: 'h',
      fixed: 2,
    },
    [MetricTypes.exec_time_median]: {
      title: i18n.t(i18nKeys.biz_perf_exec_time_median),
      unit: 'h',
      fixed: 2,
    },
    [MetricTypes.exec_true_ratio]: { title: '????', unit: '%', fixed: 2 },
    [MetricTypes.extreme_high_percent]: { title: 'ExHigh 占比', unit: '%', fixed: 2 },
    [MetricTypes.fail_rate]: { title: i18n.t(i18nKeys.biz_perf_fail_rate), unit: '%', fixed: 2 },
    [MetricTypes.interrupt_task_count]: {
      title: i18n.t(i18nKeys.biz_perf_interrupt_task_count),
      unit: '',
      fixed: 0,
    },
    [MetricTypes.interrupt_task_median]: {
      title: i18n.t(i18nKeys.biz_perf_interrupt_task_median),
      unit: '',
      fixed: 0,
    },
    [MetricTypes.invalid_task_count]: {
      title: i18n.t(i18nKeys.biz_perf_invalid_task_count),
      unit: '',
      fixed: 0,
    },
    [MetricTypes.short_task_count]: {
      title: i18n.t(i18nKeys.biz_perf_short_task_count),
      unit: '',
      fixed: 0,
    },
    [MetricTypes.task_wait_mean]: {
      title: i18n.t(i18nKeys.biz_perf_task_wait_mean),
      unit: 'h',
      fixed: 2,
    },
    [MetricTypes.task_wait_median]: {
      title: i18n.t(i18nKeys.biz_perf_task_wait_median),
      unit: 'h',
      fixed: 2,
    },
  } as { [k in MetricTypes]: { title: string; unit: string; fixed: number } }
}
