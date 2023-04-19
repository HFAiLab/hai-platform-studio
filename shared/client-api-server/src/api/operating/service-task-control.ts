import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export enum ServiceTaskControlAction {
  START = 'start',
  STOP = 'stop',
  RESTART = 'restart',
}

/*
 * 控制一个服务请求参数：
 */
export type ServiceTaskControlParams = ApiServerParams &
  ChainTaskRequestInfo & {
    // 服务名
    service: string

    // 针对该服务所做的操作
    action: ServiceTaskControlAction
  }

/*
 * 控制一个服务主要响应内容：
 */
export interface ServiceTaskControlResult {
  msg?: string
}

export type ServiceTaskControlConfig = ApiServerApiConfig<
  ServiceTaskControlParams,
  ServiceTaskControlResult
>
