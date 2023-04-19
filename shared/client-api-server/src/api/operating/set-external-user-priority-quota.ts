import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 设置外部用户 Quota 请求参数：
 */
export interface SetExternalUserPriorityQuotaParams extends ApiServerParams {
  priority: number
  quota: number
  group: string
  external_username: string
  /**
   * 过期时间：这个字段在设置优先级 >= 20 的 quota 时，必须传入，小于的情况时可选的
   */
  expire_time?: string
}

/*
 * 设置外部用户 Quota 主要响应内容：
 */
export interface SetExternalUserPriorityQuotaResult {
  msg?: string
}

export type SetExternalUserPriorityQuotaConfig = ApiServerApiConfig<
  SetExternalUserPriorityQuotaParams,
  SetExternalUserPriorityQuotaResult
>
