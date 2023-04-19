import type { ExternalUserInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface GetExternalUserInfoParams extends AilabServerParams {
  yinghuo_username: string
}

export interface GetExternalUserInfoBase {
  yinghuo_username: string
}

export interface GetExternalUserInfoPublic extends GetExternalUserInfoBase {
  chinese_name: string
  organization_type: string
  school: string
  company: string
}

export type GetExternalUserInfoAdmin = GetExternalUserInfoPublic & ExternalUserInfo

export type GetExternalUserInfoResult =
  | GetExternalUserInfoBase
  | GetExternalUserInfoPublic
  | GetExternalUserInfoAdmin

export type GetExternalUserInfoApiConfig = AilabServerApiConfig<
  GetExternalUserInfoParams,
  GetExternalUserInfoResult
>
