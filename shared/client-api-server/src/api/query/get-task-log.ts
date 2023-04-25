import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取节点日志的接口参数
 */
export type GetTaskLogParams = ApiServerParams & {
  // id, chain_id, nb_name 三选一
  id?: number

  // id, chain_id, nb_name 三选一
  chain_id?: string

  // id, chain_id, nb_name 三选一
  nb_name?: string

  /**
   * 节点编号
   */
  rank: number

  /**
   * 服务名称，获取开发容器的日志的时候需要填写，一般实验不需要
   */
  service?: string

  /**
   * 增量获取日志的时候，表示上次的时间戳
   */
  last_seen?: string
}

/**
 * 增量更新的具体时间内容，一般来说客户端不需要理解
 */
export interface GetTaskLogLastSeen {
  id: number

  mtime: number

  offset: number

  timestamp: string
}

export interface TaskLogRestartLog {
  rule: string
  reason: string
  result: string
}

export type TaskLogRestartLogMap = {
  // 这里的 key 是 task_id 的字符串形式
  [key: string]: TaskLogRestartLog[]
}

/**
 * 获取节点日志的接口返回结果
 */
export interface GetTaskLogResult {
  /**
   * 日志的具体内容，很长
   */
  data: string

  /**
   * 关键错误信息，大部分时候没有，是空字符串
   */
  error_msg: string

  /**
   * 退出码，没有的话可能是 nan
   */
  exit_code: string | number

  /**
   * 增量更新的具体时间内容，一般来说客户端不需要理解
   */
  last_seen: GetTaskLogLastSeen

  msg: string

  stop_code: number

  restart_log?: TaskLogRestartLogMap
}

/**
 * 获取节点日志的接口配置
 */
export type GetTaskLogApiConfig = ApiServerApiConfig<GetTaskLogParams, GetTaskLogResult>
