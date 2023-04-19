import type { HttpServerClient } from '@hai-platform/request-client'
import { defineServerClientCreator } from '@hai-platform/request-client'
import type { AilabServerApiConfigMap, AilabServerApiName } from './configs'
import { AILAB_SERVER_API_PATHS } from './configs'

export type AilabServerClient = HttpServerClient<AilabServerApiName, AilabServerApiConfigMap>

export const createAilabServerClient = defineServerClientCreator<
  AilabServerApiName,
  AilabServerApiConfigMap
>({
  API_PATHS: AILAB_SERVER_API_PATHS,
  API_CONFIG_HANDLERS: {},
}).createServerClient
