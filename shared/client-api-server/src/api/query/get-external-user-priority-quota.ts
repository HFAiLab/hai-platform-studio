import type { UserQuotaInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取外部用户 Quota 的接口参数
 */
export type GetExternalUserPriorityQuotaParams = ApiServerParams

/**
 * 获取外部用户 Quota 的接口返回结果
 */
export type GetExternalUserPriorityQuotaResult = {
  data: UserQuotaInfo[]
}

/**
 * 获取外部用户 Quota 的接口配置
 */
export type GetExternalUserPriorityQuotaApiConfig = ApiServerApiConfig<
  GetExternalUserPriorityQuotaParams,
  GetExternalUserPriorityQuotaResult
>
