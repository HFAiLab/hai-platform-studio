import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 确认是否需要上传日志的 的接口参数
 */
export type QueryShouldUploadParams = AilabServerParams

export interface QueryShouldUploadBody {
  // 用户 ID
  uid: string
  // 存储浏览器信息的指纹
  fingerprint: string
  // 渠道
  channel: string
}

/**
 * 确认是否需要上传日志的 的接口返回结果
 */
export interface QueryShouldUploadResult {
  shouldUpload: boolean
  lastRid: string
}
/**
 * 确认是否需要上传日志的 的接口配置
 */
export type QueryShouldUploadApiConfig = AilabServerApiConfig<
  QueryShouldUploadParams,
  QueryShouldUploadResult,
  QueryShouldUploadBody
>
