import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type DatasetRequestSTSTokenParams = AilabServerParams

export interface DatasetRequestSTSTokenBody {
  id: string
  ttl_seconds: number
}

/*
 * 生成 oss 的 sts 授权，直接写到库中，返回结果是描述一则成功消息
 */
export type DatasetRequestSTSTokenResult = string

export type DatasetRequestSTSTokenConfig = AilabServerApiConfig<
  DatasetRequestSTSTokenParams,
  DatasetRequestSTSTokenResult,
  DatasetRequestSTSTokenBody
>
