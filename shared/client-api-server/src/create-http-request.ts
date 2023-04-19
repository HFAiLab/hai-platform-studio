import type { HttpRequestConfig, HttpRequestFunction } from '@hai-platform/request-client'
import axios from 'axios'
import * as queryString from 'query-string'
import { API_SERVER_CONVERT_PATHS, ORIGIN_URL_CONVERTERS } from './configs'
import type { ApiServerResponseData } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertHttpResponse = <T>(config: HttpRequestConfig, data: any, name: string): T => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const originUrl = ORIGIN_URL_CONVERTERS[name] ? ORIGIN_URL_CONVERTERS[name]!(config) : config.url!

  if (!API_SERVER_CONVERT_PATHS.includes(originUrl)) {
    if (data.msg && data.result && typeof data.result === 'object' && !data.result.msg) {
      data.result.msg = data.msg
    }
    return data
  }
  let { success } = data
  const { msg } = data

  if (success === undefined) {
    success = true
  }

  const result = data
  delete result.success
  // hint: result 里面包含了 msg，方便使用的人使用
  return {
    success,
    msg,
    result,
  } as unknown as T
}

export const createHttpRequest = (defaultConfig: HttpRequestConfig): HttpRequestFunction => {
  const axiosInstance = axios.create({
    method: 'POST',
    paramsSerializer: (params) => queryString.stringify(params, { arrayFormat: 'none' }),
    // https://github.com/axios/axios/issues/4531
    proxy: false,
    ...defaultConfig,
  })
  const request = async <T>(config: HttpRequestConfig, name: string): Promise<T> => {
    const data = convertHttpResponse<ApiServerResponseData<T>>(
      config,
      (await axiosInstance.request(config)).data,
      name,
    )

    if (data.success === 0) {
      throw new Error(data.msg)
    }

    // @ts-expect-error create task 特殊处理
    return config.url === 'create_task' ? data.task : data.result ?? data
  }
  return request
}
