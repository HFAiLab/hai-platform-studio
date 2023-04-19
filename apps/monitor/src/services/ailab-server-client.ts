import {
  AilabServerApiName,
  createAilabServerClient,
  createHttpRequest,
} from '@hai-platform/client-ailab-server'
import type { AilabServerClient, GetUsers3fsIoResult } from '@hai-platform/client-ailab-server'
import { getBFFURL } from '@/config'

export { AilabServerApiName }
export type { GetUsers3fsIoResult as Users3fsIo }

export const ailabServerClient: AilabServerClient = createAilabServerClient({
  httpRequest: createHttpRequest({
    baseURL: getBFFURL(),
  }),
})
