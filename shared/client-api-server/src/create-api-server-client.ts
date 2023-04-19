import type { HttpServerClient } from '@hai-platform/request-client'
import { defineServerClientCreator } from '@hai-platform/request-client'
import { API_CONFIG_HANDLERS, API_SERVER_API_PATHS } from './configs'
import type { ApiServerApiConfigMap, ApiServerApiName } from './configs'

export type ApiServerClient = HttpServerClient<ApiServerApiName, ApiServerApiConfigMap>

export const createApiServerClient = defineServerClientCreator<
  ApiServerApiName,
  ApiServerApiConfigMap
>({
  API_PATHS: API_SERVER_API_PATHS,
  // 可以写单个 handler 或者数组，数组的话就串联从前向后执行
  API_CONFIG_HANDLERS,
}).createServerClient
