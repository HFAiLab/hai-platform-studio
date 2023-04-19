import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 获取当前应用的最新版本请求参数：
 */
export interface GetLatestAppVersionParams extends AilabServerParams {
  app_name: string
  base_app_version: string
}

/*
 *获取当前应用的最新版本响应内容：
 */
export interface GetLatestAppVersionResult {
  version: string
}

export type GetLatestAppVersionConfig = AilabServerApiConfig<
  GetLatestAppVersionParams,
  GetLatestAppVersionResult
>
