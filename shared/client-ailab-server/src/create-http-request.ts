import type { HttpRequestConfig, HttpRequestFunction } from '@hai-platform/request-client'
import axios from 'axios'
import type { AilabServerResponseData } from './types'

export const createHttpRequest = (defaultConfig?: HttpRequestConfig): HttpRequestFunction => {
  const axiosInstance = axios.create({
    method: 'POST',
    // https://github.com/axios/axios/issues/4531
    proxy: false,
    ...defaultConfig,
  })
  const request = async <T>(config: HttpRequestConfig): Promise<T> => {
    if (!config.headers?.token && config.params.token) {
      config.headers ??= {}
      config.headers.token = config.params.token
      delete config.params.token
    }

    const { data } = await axiosInstance.request<AilabServerResponseData<T>>(config)
    if (data.success === false) {
      throw new Error(data.msg)
    }
    return data.data
  }
  return request
}
