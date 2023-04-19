import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 暴露服务端口的请求参数：
 */
export interface NodePortSvcParams extends ApiServerParams {
  id: number

  usage: string

  dist_port: number
}
/*
 * 暴露服务端口的响应内容：
 */
export interface NodePortSvcResult {
  msg?: string
}

export type NodePortSvcConfig = ApiServerApiConfig<NodePortSvcParams, NodePortSvcResult>
