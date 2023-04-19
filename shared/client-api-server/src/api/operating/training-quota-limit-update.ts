import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 设置内部用户 Quota 限额请求参数：
 */
export interface TrainingQuotaLimitUpdateParams extends ApiServerParams {
  priority: number
  quota: number
  group: string
  internal_username: string
}

/*
 * 设置内部用户 Quota 限额主要响应内容：
 */
export interface TrainingQuotaLimitUpdateResult {
  msg?: string
}

export type TrainingQuotaLimitUpdateConfig = ApiServerApiConfig<
  TrainingQuotaLimitUpdateParams,
  TrainingQuotaLimitUpdateResult
>
