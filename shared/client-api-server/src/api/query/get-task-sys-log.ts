import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取节点系统日志的接口参数
 */
export interface GetTaskSysLogParams extends ApiServerParams {
  chain_id: string

  /**
   * 服务名称，获取开发容器的日志的时候需要填写，一般实验不需要
   */
  service?: string
}

/**
 * 增量更新的具体时间内容，一般来说客户端不需要理解
 */
export interface GetTaskSysLogLastSeen {
  id: number

  mtime: number

  offset: number

  timestamp: string
}

/**
 * 获取节点系统日志的接口返回结果
 */
export interface GetTaskSysLogResult {
  /**
   * 日志的具体内容，一般不算很长
   */
  data: string
}

/**
 * 获取节点系统日志的接口配置
 */
export type GetTaskSysLogApiConfig = ApiServerApiConfig<GetTaskSysLogParams, GetTaskSysLogResult>
