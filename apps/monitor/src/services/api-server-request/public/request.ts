import { ApiServerApiName, convertHttpResponse } from '@hai-platform/client-api-server'
import type {
  ApiServerResponseData,
  GetNodesPerformanceResult,
  GetNodesSummarySeriesResult,
  GetStorageQuotaHistoryResult,
  GetStorageQuotaResult,
  GetTasksDistributionResult,
  NodesPerformanceItem,
  NodesSummarySeriesItem,
} from '@hai-platform/client-api-server'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import qs from 'qs'
import { getCurrentClusterServerURL, getProxyURL } from '@/config'

export type { GetTasksDistributionResult as TasksDistribution }

export { ApiServerApiName }
export type {
  GetStorageQuotaResult as StorageQuota,
  GetStorageQuotaHistoryResult as StorageQuotaHistory,
  GetNodesPerformanceResult as NodesPerformance,
  GetNodesSummarySeriesResult as NodesSummarySeries,
  NodesPerformanceItem,
  NodesSummarySeriesItem,
}

const combineURLs = (baseURL: string, relativeURL: string): string => {
  return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createProxyRequest = (defaultConfig?: AxiosRequestConfig) => {
  const axiosInstance = axios.create({
    method: 'POST',
    paramsSerializer: (params: any) => qs.stringify(params, { arrayFormat: 'repeat' }),
    // https://github.com/axios/axios/issues/4531
    proxy: false,
    ...defaultConfig,
  })

  const request = async <T>(config: AxiosRequestConfig, name: string): Promise<T> => {
    const serverEndPoint = getCurrentClusterServerURL()
    const url = combineURLs(serverEndPoint, config.url!)
    const endPoint = new URL(url).pathname

    // proxy 后端请求时实际使用的 config
    const realConfig = {
      method: 'POST',
      proxy: false,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        'token': `${config.params.token}`,
        ...(config.headers || {}),
      },
    }

    const reqURL = `${getProxyURL()}?endPoint=${endPoint}`
    const reqBody = {
      url,
      config: realConfig,
    }

    const newConfig: AxiosRequestConfig = {
      method: 'POST',
      data: reqBody,
      url: reqURL,
      headers: {
        'Content-Type': 'application/json',
        'token': `${config.params.token}` || `${realConfig.headers.token}`,
      },
    }

    const data = convertHttpResponse<ApiServerResponseData<T>>(
      config,
      (await axiosInstance.request(newConfig)).data,
      name,
    )

    if (data.success !== 1) {
      throw new Error(data.msg)
    }
    return data.result ?? (data as unknown as T)
  }

  return request
}
