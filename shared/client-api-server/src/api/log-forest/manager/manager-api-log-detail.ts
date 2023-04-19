import type { ApiServerApiConfig } from '../../../types'
import type { LogForestLogDetailApiParams, LogForestManagerPodSeverity } from '../common'

export type LogForestApiLogDetailApiParamsMode = 'minute' | '15_minutes' | 'hour' | 'day'
/**
 * 获取 Manager 日志详情数据的接口参数
 */
export type LogForestManagerLogDetailApiParams = LogForestLogDetailApiParams

export interface LogForestManagerLogDetailTreeNode {
  value: number
  name: string
  manager: string[]
  severity: LogForestManagerPodSeverity
  children: LogForestManagerLogDetailTreeNode[]
}

/**
 * 获取 Manager 日志详情数据的接口返回结果
 */
export type LogForestManagerLogDetailApiResult = LogForestManagerLogDetailTreeNode

/**
 * 获取 Manager 日志详情数据的接口配置
 */
export type LogForestManagerLogDetailApiConfig = ApiServerApiConfig<
  LogForestManagerLogDetailApiParams,
  LogForestManagerLogDetailApiResult
>
