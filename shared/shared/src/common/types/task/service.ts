export type BuiltinServiceListType = 'jupyter' | 'ssh'

export type ContainerServicePortType = 'http' | 'tcp' | 'local'

export type ContainerServiceType = 'builtin' | 'custom'

/**
 * 内建服务，这个是提交的时候用的，所以字段比较少
 */
export interface BuiltinService {
  name: BuiltinServiceListType
  watch_state: boolean
}

/**
 * 内建服务，这个是服务端返回的，相对比较全的字段
 */
export interface BuiltinServiceResponse extends BuiltinService {
  port: number
  type: ContainerServicePortType
  startup_script: string
  alive?: boolean // 早期数据没有这个属性
}

/**
 * 自定义服务，提交和返回都可以用
 */
export interface CustomService {
  name: string
  port?: number
  type?: ContainerServicePortType
  startup_script: string
  watch_state: boolean
  alive?: boolean // 早期数据没有这个属性
}

export interface MixService {
  type: ContainerServiceType
  builtin_service?: BuiltinService
  custom_service?: CustomService
}

/**
 * 为了保持统一，我们先加一个 Response 是直接等于的
 */
export type CustomServiceResponse = CustomService

/**
 * 容器的服务的通用的 schema，感觉后面维护这一个 schema 就行了
 */
export type ContainerService = BuiltinServiceResponse | CustomServiceResponse
