import type { ApiServerApiConfig, ApiServerParams } from '../../../types'
import type { LogForestDataBaseLogOverviewMeta } from './database-log-overview'

/**
 * 获取数据库大盘详情数据的接口参数
 */
export interface LogForestDataBaseLogDetailApiParams extends ApiServerParams {
  /**
   * 开始区间
   */
  start_time: string
  /**
   * 结束区间
   */
  end_time: string
  /**
   * 用于分类的参数
   */
  abstract: string
  /**
   * 用于分类的参数
   */
  application_name: string
}

export interface LogForestDataBaseLogDetail extends LogForestDataBaseLogOverviewMeta {
  statement: string

  table: string

  user_name: string
}

/**
 * 获取数据库大盘详情数据的接口返回结果
 */
export type LogForestDataBaseLogDetailApiResult = LogForestDataBaseLogDetail[]

/**
 * 获取数据库大盘详情数据的接口配置
 */
export type LogForestDataBaseLogDetailApiConfig = ApiServerApiConfig<
  LogForestDataBaseLogDetailApiParams,
  LogForestDataBaseLogDetailApiResult
>
