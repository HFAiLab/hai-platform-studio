import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 申请恢复 Quota 请求参数：
 */
export type ApplyQuotaForWekaUsageParams = ApiServerParams

/*
 * 申请恢复 Quota 响应内容：
 */
export type ApplyQuotaForWekaUsageResult = undefined

export type ApplyQuotaForWekaUsageApiConfig = ApiServerApiConfig<
  ApplyQuotaForWekaUsageParams,
  ApplyQuotaForWekaUsageResult
>
