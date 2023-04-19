import type { ApiServerClient, ApiServerResponseData } from '@hai-platform/client-api-server'
import { convertHttpResponse, createApiServerClient } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { composeErrorMessage } from '@hai-platform/shared'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import qs from 'qs'
import {
  AppToaster,
  getCurrentAgencyToken,
  getCurrentClusterServerURL,
  getStudioClusterServerHost,
  getToken,
} from '../utils'
import { t } from '../utils/lan'
import { proxyUrl } from './request'

function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL
}

export const createRequest = (defaultConfig?: AxiosRequestConfig) => {
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

    if (!config.params) {
      config.params = { token: getCurrentAgencyToken() || getToken() }
    }

    if (config.params && !config.params.token) {
      config.params.token = getCurrentAgencyToken() || getToken()
    }

    // proxy 后端请求时实际使用的 config
    const realConfig = {
      method: 'POST',
      proxy: false,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        'token': `${getToken()}`,
        'x-custom-host': getStudioClusterServerHost(),
        ...(config.headers || {}),
      },
    }

    const reqURL = `${proxyUrl}?endPoint=${endPoint}`
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
        'token': `${getToken()}` || `${realConfig.headers.token}`,
      },
    }

    let data: ApiServerResponseData<T>
    try {
      data = convertHttpResponse<ApiServerResponseData<T>>(
        config,
        (await axiosInstance.request(newConfig)).data,
        name,
      )
    } catch (e) {
      AppToaster.show({
        message: t(i18nKeys.biz_cluster_internal_server_error, {
          url: `${config.url}`,
        }),
        intent: 'danger',
        icon: 'error',
      })
      throw composeErrorMessage(e)
    }

    if (data.success !== 1) {
      AppToaster.show({
        message: `${i18n.t(i18nKeys.biz_cluster_internal_server_not_success, {
          url: endPoint,
        })}, detail: ${data.msg}`,
        intent: 'danger',
        icon: 'error',
      })
      throw new Error(data.msg)
    }
    return data.result
  }

  return request
}

export const GlobalApiServerClient: ApiServerClient = createApiServerClient({
  httpRequest: createRequest(),
})
