import { URL } from 'url'
import { HFNoCacheHeader } from '@hai-platform/shared'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import qs from 'qs'
import { axiosApiCounter } from './metrics'

export const getAxiosInstance = (additionalConfig: Partial<AxiosRequestConfig> = {}) => {
  const axiosInstance = axios.create({
    headers: HFNoCacheHeader,
    paramsSerializer: (params: any) => qs.stringify(params, { arrayFormat: 'repeat' }),
    ...additionalConfig,
  })

  // 用于所有请求的统计 hook
  axiosInstance.interceptors.request.use((config) => {
    if (config.url) {
      const url = new URL(axiosInstance.getUri(config))
      axiosApiCounter.inc(
        {
          host: url.host,
          path: url.pathname,
        },
        1,
      )
    } else {
      axiosApiCounter.inc(
        {
          host: 'None',
          path: 'None',
        },
        1,
      )
    }
    return config
  })
  return axiosInstance
}

// 全局默认都使用这个 axios:
export const axiosNoCache: AxiosInstance = getAxiosInstance()
