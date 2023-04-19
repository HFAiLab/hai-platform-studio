import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 全局搜索日志的接口参数
 */
export type SearchInGlobalParams = ChainTaskRequestInfo &
  ApiServerParams & {
    content: string
  }

/**
 * 全局搜索日志的接口返回结果
 */
export interface SearchInGlobalResult {
  /**
   * 日志的具体内容，很长
   */
  data: number[]
}

/**
 * 全局搜索日志的接口配置
 */
export type SearchInGlobalApiConfig = ApiServerApiConfig<SearchInGlobalParams, SearchInGlobalResult>
