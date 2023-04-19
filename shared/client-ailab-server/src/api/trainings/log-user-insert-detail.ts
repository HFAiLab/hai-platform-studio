import type { UserInsertDetailParams } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 日志主动上传 的接口参数
 */
export type LogUserInsertDetailParams = AilabServerParams

export interface LogUserInsertDetailBody {
  data: UserInsertDetailParams
}

/**
 * 日志主动上传 的接口返回结果
 */
export type LogUserInsertDetailResult = undefined | null

/**
 * 日志主动上传 的接口配置
 */
export type LogUserInsertDetailApiConfig = AilabServerApiConfig<
  LogUserInsertDetailParams,
  LogUserInsertDetailResult,
  LogUserInsertDetailBody
>
