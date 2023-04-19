import type { ApiServerApiConfig, ApiServerParams } from '../../../types'
import type { LogForestManagerPodSeverity } from '../common'

/**
 * 获取 Manager 日志 pod 状态的接口参数
 */
export type LogForestManagerLogPodStatusApiParams = ApiServerParams

export interface LogForestNormalPodsStatusInfo {
  created: string[]
  building: string[]
  unschedulable: string[]
  scheduled: string[]
  running: string[]
  succeeded: string[]
  failed: string[]
  stopped: string[]
  unknown: string[]
}

export interface LogForestAbnormalPodSingleInfo {
  note: string
  severity: LogForestManagerPodSeverity
  data: string[]
}
/**
 * 获取 Manager 日志详情数据的接口返回结果
 */
export interface LogForestManagerLogPodStatusApiResult {
  manager_status: LogForestNormalPodsStatusInfo
  training_pod_status: LogForestNormalPodsStatusInfo
  abnormal_status: LogForestAbnormalPodSingleInfo[]
}

/**
 * 获取 Manager 日志详情数据的接口配置
 */
export type LogForestManagerLogPodStatusApiConfig = ApiServerApiConfig<
  LogForestManagerLogPodStatusApiParams,
  LogForestManagerLogPodStatusApiResult
>
