import type { HttpServerApiConfig } from '@hai-platform/request-client'

/**
 * Api Server 的基础请求参数
 */
export interface ApiServerParams {
  /**
   * 所有请求都需要传入 token
   */
  token?: string
}

/**
 * Api Server 的基础响应数据类型
 */
export type ApiServerResponseData<SucceedData> =
  | ApiServerResponseDataSucceed<SucceedData>
  | ApiServerResponseDataFailed

/**
 * Api Server 的成功响应数据类型
 */
export interface ApiServerResponseDataSucceed<T> {
  success: 1
  result: T
  msg?: string
}

/**
 * Api Server 的失败响应数据类型
 */
export interface ApiServerResponseDataFailed {
  success: 0
  msg: string
}

/**
 * Api Server 的接口配置
 */
export type ApiServerApiConfig<
  Params extends ApiServerParams,
  Result,
  // hint: axios 本身默认是 any，这里保持一致
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Body = any,
> = HttpServerApiConfig<Params, Result, Body>
