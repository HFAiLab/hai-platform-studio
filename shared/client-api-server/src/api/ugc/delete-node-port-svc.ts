import type { ChainTaskRequestInfo } from '../../common-request-schema'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 删除暴露服务端口的请求参数：
 */
export type DeleteNodePortSvcParams = ApiServerParams &
  ChainTaskRequestInfo & {
    usage: string

    dist_port: number
  }

/*
 * 暴露服务端口的响应内容：
 */
export interface DeleteNodePortSvcResult {
  msg?: string
}

export type DeleteNodePortSvcConfig = ApiServerApiConfig<
  DeleteNodePortSvcParams,
  DeleteNodePortSvcResult
>
