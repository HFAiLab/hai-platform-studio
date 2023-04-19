import type { ExtendedTask, ServiceTaskCreateV2Schema } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 创建开发容器的最新版本请求参数：
 */
export interface ServiceTaskCreateV2Params extends ApiServerParams {
  /**
   * 管理员帮助普通用户创建的时候需要指定 user_name
   */
  user_name?: string
}

/**
 * 创建开发容器的最新版本请求参数（写到 body 里面）
 */
export type ServiceTaskCreateV2Body = ServiceTaskCreateV2Schema

/*
 * 创建开发容器的主要响应内容：
 */
export interface ServiceTaskCreateV2Result {
  task: ExtendedTask
}

export type ServiceTaskCreateV2Config = ApiServerApiConfig<
  ServiceTaskCreateV2Params,
  ServiceTaskCreateV2Result,
  ServiceTaskCreateV2Body
>
