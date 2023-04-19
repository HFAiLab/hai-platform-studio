import type { ApiServerClient, ApiServerResponseData } from '@hai-platform/client-api-server'
import { convertHttpResponse, createApiServerClient } from '@hai-platform/client-api-server'
import { HFNoCacheHeader } from '@hai-platform/shared'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import curlirize from 'axios-curlirize'
import { getAxiosInstance } from '../base/axios'
import { logger } from '../base/logger'
import { DEFAULT_REQ_TIMEOUT, GlobalConfig } from '../config'
import { serverMonitor } from '../monitor'

export const createRequest = (defaultConfig?: AxiosRequestConfig) => {
  const axiosInstance = getAxiosInstance({
    baseURL: GlobalConfig.CLUSTER_SERVER_URL,
    method: 'POST',
    proxy: false,
    headers: {
      // 一般 bff 的请求程度也不会触发 cache，不过加上这个更加保险
      ...HFNoCacheHeader,
    },
    timeout: DEFAULT_REQ_TIMEOUT, // 都是 10 秒的超时啦
    ...defaultConfig,
  })
  if (GlobalConfig.ENABLE_ONLINE_DEBUG)
    curlirize(axiosInstance, (result: { command: any }) => {
      const { command } = result
      logger.info(`[api-server] request to curl: ${command}`)
    })

  const request = async <T>(config: AxiosRequestConfig, name: string): Promise<T> => {
    try {
      const beginTime = Date.now()
      const response = await axiosInstance.request(config)
      const data = convertHttpResponse<ApiServerResponseData<T>>(config, response.data, name)
      if (GlobalConfig.ENABLE_ONLINE_DEBUG)
        logger.info(`[api-server] request ${config.url} cost: ${Date.now() - beginTime}`)
      if (data.success !== 1) {
        throw new Error(data.msg)
      }
      return data.result
    } catch (e) {
      serverMonitor.reportV2AxiosError(e as AxiosError)
      throw e
    }
  }
  return request
}

export const GlobalApiServerClient: ApiServerClient = createApiServerClient({
  httpRequest: createRequest(),
})
