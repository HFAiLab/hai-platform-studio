import type { AilabServerClient, AilabServerResponseData } from '@hai-platform/client-ailab-server'
import { createAilabServerClient } from '@hai-platform/client-ailab-server'
import { composeErrorMessage } from '@hai-platform/shared'
import { LevelLogger } from '@hai-platform/studio-toolkit'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import qs from 'qs'
import {
  AppToaster,
  CONSTS,
  bffUrl,
  getCurrentClusterServerURL,
  getStudioClusterServerHost,
  getToken,
  hasCustomMarsServer,
} from '../utils'
import { AilabCountly, CountlyEventKey } from '../utils/countly'

export const createRequest = (defaultConfig?: AxiosRequestConfig) => {
  const axiosInstance = axios.create({
    baseURL: bffUrl,
    method: 'POST',
    paramsSerializer: (params: any) => qs.stringify(params, { arrayFormat: 'repeat' }),
    ...defaultConfig,
  })
  const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    if (!config.headers) config.headers = {}
    // hint: 实际请求的时候加 token，防止 token 不够新
    config.headers.token = `${getToken()}`

    if (hasCustomMarsServer()) {
      if (!CONSTS.DebugAilabServerPathWhiteList.includes(config.url || '')) {
        throw new Error(`not allowed: ${config.url}`)
      }
      if (!config.headers) config.headers = {}
      config.headers['x-custom-host'] = getStudioClusterServerHost()
      config.headers['x-custom-mars-server'] = getCurrentClusterServerURL()
    }

    let response: AxiosResponse<AilabServerResponseData<T>, any>
    try {
      response = await axiosInstance.request<AilabServerResponseData<T>>(config)
    } catch (e) {
      AppToaster.show({
        message: `集群接入层返回错误：${config.url} ${e}`,
        intent: 'danger',
        icon: 'warning-sign',
      })
      throw composeErrorMessage(e)
    }

    try {
      if (response.status !== 200) {
        const { pathname } = new URL(config.url || '')
        AppToaster.show({
          message: `集群接入层返回错误：path: ${pathname}, status: ${response.status}`,
          intent: 'danger',
          icon: 'warning-sign',
        })
        throw new Error(`http response error: [${response.status}]${response.data}`)
      }

      const { data } = response

      if (!data.success) {
        AppToaster.show({
          message: `集群接入层返回错误：path: ${config.url}, msg: ${data.msg || ''}`,
          intent: 'danger',
          icon: 'warning-sign',
        })
        throw new Error(data.msg)
      }
      return data.data
    } catch (e) {
      AilabCountly.safeReport(CountlyEventKey.bffRequestUnknownError)
      LevelLogger.error('ailabServer request error:', e)
      throw e
    }
  }
  return request
}

export const GlobalAilabServerClient: AilabServerClient = createAilabServerClient({
  httpRequest: createRequest(),
})
