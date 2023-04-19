import type { InsertDetailParams } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 日志被动上传 的接口参数
 */
export type LogInsertDetailParams = AilabServerParams

export interface LogInsertDetailBody {
  data: InsertDetailParams
}

/**
 * 日志被动上传 的接口返回结果
 */
export type LogInsertDetailResult = undefined | null

/**
 * 日志被动上传 的接口配置
 */
export type LogInsertDetailApiConfig = AilabServerApiConfig<
  LogInsertDetailParams,
  LogInsertDetailResult,
  LogInsertDetailBody
>
