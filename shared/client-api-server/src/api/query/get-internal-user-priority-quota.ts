import type { UserQuotaInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 获取内部用户 Quota 的接口参数
 */
export type GetInternalUserPriorityQuotaParams = ApiServerParams

/**
 * 获取内部用户 Quota 的接口返回结果
 */
export type GetInternalUserPriorityQuotaResult = {
  data: UserQuotaInfo[]
}

/**
 * 获取内部用户 Quota 的接口配置
 */
export type GetInternalUserPriorityQuotaApiConfig = ApiServerApiConfig<
  GetInternalUserPriorityQuotaParams,
  GetInternalUserPriorityQuotaResult
>
