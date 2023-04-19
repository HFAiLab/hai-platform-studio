import type { ClusterUserMessageSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取集群通知消息 的接口参数
 */
export type ClusterMessageParams = AilabServerParams

/**
 * 获取集群通知消息 的接口返回结果
 */
export interface ClusterMessageResult {
  messages: ClusterUserMessageSchema[]
}

/**
 * 获取集群通知消息 的接口配置
 */
export type ClusterMessageApiConfig = AilabServerApiConfig<
  ClusterMessageParams,
  ClusterMessageResult
>
