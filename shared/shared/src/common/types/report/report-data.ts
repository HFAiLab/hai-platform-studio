export enum ReportTaskType {
  cpu = 'cpu',
  gpu = 'gpu',
}

export enum DatePeriod {
  realtime = 'realtime',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}

// 性能指标
export interface PerformanceMetrics {
  gpu_rate: number
  gpu_power: number
  gpu_p2u: number
  gpu_hours: number
  gpu_occupied_percent: number
  ib_usage: number
  cpu_rate: number
  mem_usage: number
}

export interface PerformanceMetricsMap {
  [key: string]: PerformanceMetrics
}

// 任务指标
export interface TaskMetrics {
  chain_task_count: number
  extreme_high_percent: number
  interrupt_task_count: number
  interrupt_task_median: number
  short_task_count: number
  fail_rate: number

  exec_time_mean: number
  exec_time_median: number
  exec_true_ratio: number
  task_wait_mean: number
  task_wait_median: number
  invalid_task_count: number
}

export interface TaskMetricsMap {
  [key: string]: TaskMetrics
}

// 龙虎榜
export interface RankFeatures {
  rank: number
  gpu_rate: number
  gpu_power: number
  gpu_p2u: number
  gpu_hours: number
}

export interface RankFeaturesMap {
  [key: string]: RankFeatures
}

export interface RawMetrics {
  username: string // hint: 这个是原始用户名
  user: string
  gpu_rate: number
  gpu_power: number
  gpu_hours: number
  gpu_occupied_percent: number
  chain_task_count: number
  extreme_high_percent: number
  interrupt_task_count: number
  interrupt_task_median: number
  short_task_count: number
  fail_rate: number
  ib_usage: number
  cpu_rate: number
  mem_usage: number

  exec_time_mean: number
  exec_time_median: number
  exec_true_ratio: number
  task_wait_mean: number
  task_wait_median: number
  invalid_task_count: number
}

export type RawMetricsList = RawMetrics[]

export interface TopRankInfo {
  user: string
  user_name: string
  rank: number
  gpu_rate: number
  gpu_power: number
  gpu_p2u: number
  gpu_hours: number
}

export interface ReportData {
  performance: PerformanceMetrics
  ranks: RankFeatures
  tasks: TaskMetrics
  topRanks: TopRankInfo[]
}

export interface ReportDataResponse {
  reportData?: ReportData
  dateStr: string
}
