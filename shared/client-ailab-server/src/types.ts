import type { HttpServerApiConfig } from '@hai-platform/request-client'

/**
 * AILab Server 的基础请求参数
 */
export interface AilabServerParams {
  /**
   * 所有请求都需要传入 token
   */
  token?: string
}

/**
 * AILab Server 的基础响应数据类型
 */
export type AilabServerResponseData<SucceedData, FailedData = SucceedData> =
  | AilabServerResponseDataSucceed<SucceedData>
  | AilabServerResponseDataFailed<FailedData>

/**
 * AILab Server 的成功响应数据类型
 */
export interface AilabServerResponseDataSucceed<T> {
  success: true
  data: T
  msg?: string
}

/**
 * AILab Server 的失败响应数据类型
 */
export interface AilabServerResponseDataFailed<T> {
  success: false
  data: T
  msg?: string
}

/**
 * AILab Server 的接口配置
 */
export type AilabServerApiConfig<
  Params extends AilabServerParams,
  Result,
  // hint: axios 本身默认是 any，这里保持一致
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Body = any,
> = HttpServerApiConfig<Params, Result, Body>

export interface NanoDatasetMeta {
  name: string
  status: string
  size: string
}
