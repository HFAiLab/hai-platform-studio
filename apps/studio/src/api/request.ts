import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { BFFResponseWithType } from '@hai-platform/studio-schemas/lib/esm/bff/router'
import { LevelLogger } from '@hai-platform/studio-toolkit/lib/esm'
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import {
  AppToaster,
  CONSTS,
  bffUrl,
  getCurrentClusterServerURL,
  getStudioClusterServerHost,
  getToken,
  hasCustomMarsServer,
} from '../utils'

export type QueryType = 'gpu' | 'cpu' | 'every_card' | 'mem'

export type TaskTsObj = {
  start: number
  end: number
  series: Array<Array<any>>
  id: string | number
  rank: number
  type: QueryType
  node?: string
}

export const proxyUrl = `${bffUrl}/proxy/s`

export async function req<T, R>(config: AxiosRequestConfig<T>): Promise<R | null> {
  if (!config.headers) config.headers = {}
  config.headers.token = `${getToken()}`

  if (hasCustomMarsServer()) {
    if (!CONSTS.DebugAilabServerPathWhiteList.includes(config.url || '')) {
      return null
    }
    if (!config.headers) config.headers = {}
    config.headers['x-custom-host'] = getStudioClusterServerHost()
    config.headers['x-custom-mars-server'] = getCurrentClusterServerURL()
  }

  try {
    const response = await axios(config)

    const responseContent = response.data as BFFResponseWithType<R>

    if (response.status !== 200) {
      const { pathname } = new URL(config.url || '')
      AppToaster.show({
        message: `server return error, path: ${pathname}, status: ${response.status}`,
        intent: 'warning',
        icon: 'warning-sign',
      })
      return null
    }
    if (!responseContent.success) {
      const { pathname } = new URL(config.url || '')
      AppToaster.show({
        message: `server return error, path: ${pathname}, msg: ${responseContent.msg || ''}`,
        intent: 'warning',
        icon: 'warning-sign',
      })
      return null
    }

    return responseContent.data
  } catch (e) {
    LevelLogger.error(`[req] common get error: ${e}`)
    AppToaster.show({
      message: i18n.t(i18nKeys.biz_internal_server_error, {
        url: config.url || '',
      }),
      intent: 'danger',
      icon: 'error',
    })
    return null
  }
}
