import type { ContainerTask, UserImageInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 开发容器需求，获取当前用户任务列表的接口参数
 */
export type ServiceTaskTasksApiParams = ApiServerParams

export interface NodePortGroup {
  [key: string]: NodePort[]
}

export interface NodePort {
  dist_port: number
  rank: number
  src_port: number
  alias: string
  ip: string
}

export interface NodePortQuota {
  quota: number
  used_quota: number
}

export interface ContainerQuotaObject {
  [key: string]: JupyterQuota
}

export interface JupyterQuota {
  allocatable: number
  cpu: number
  max_cpu_core: number
  memory: number
  not_working: number
  quota: number
  running: number
}

export interface SpotJupyterStatus {
  /**
   * 当前是否可以创建
   */
  can_create: boolean
  /**
   * 是否可以使用
   */
  can_run: boolean
  /**
   * 当前已经创建的是否超过最大数量
   */
  max_num_exceeded: boolean
  /**
   * 当前集群过于繁忙以至于不能创建
   */
  too_busy_to_create: boolean
}

/**
 * 开发容器需求，获取当前用户任务列表的接口返回结果
 */
export interface ServiceTaskTasksApiResult {
  tasks: ContainerTask[]
  environments: string[]
  /**
   * 用户的自定义镜像，用以提交自定义任务
   */
  hfai_images?: UserImageInfo[]
  quota: ContainerQuotaObject
  nodeports: NodePortGroup
  nodeport_quota: NodePortQuota
  /**
   * 外部用户才有的字段，标志有多少 spot 容器 quota
   */
  spot_jupyter_quota?: number
  /**
   * 外部用户才有的字段，标志有多少独占容器 quota
   */
  dedicated_jupyter_quota?: number

  /**
   * 是否可以抢占别人的节点，极少数用户有这个权利
   */
  can_suspend: boolean

  /**
   * 外部用户创建 spot container 相关的状态字段
   */
  spot_jupyter_status?: SpotJupyterStatus
}

/**
 * 开发容器需求，获取当前用户任务列表的接口配置
 */
export type ServiceTaskTasksApiConfig = ApiServerApiConfig<
  ServiceTaskTasksApiParams,
  ServiceTaskTasksApiResult
>
