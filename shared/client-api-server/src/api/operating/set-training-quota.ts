import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 设置用户 Quota 的请求参数：
 */
export interface SetTrainingQuotaParams extends ApiServerParams {
  token: string

  /**
   * 分组
   */
  group_label: string

  /**
   * 优先级
   */
  priority_label: string

  /**
   * 设置的 Quota
   */
  quota: number
}

/*
 * 设置用户 Quota 的主要响应内容：
 */
export type SetTrainingQuotaResult = {
  worker_user_info: {
    quota: Record<string, number>
    quota_limit: Record<string, number>
    all_quota: Record<string, number>
    already_used_quota: Record<string, number>
    user_name: string
  }
}

export type SetTrainingQuotaConfig = ApiServerApiConfig<
  SetTrainingQuotaParams,
  SetTrainingQuotaResult
>
