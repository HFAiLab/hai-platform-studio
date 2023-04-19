import type { ExternalUserAccount, ExternalUserInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type GetExternalAccountListsParams = AilabServerParams

export type GetExternalAccountListsResult = {
  infos: ExternalUserInfo[]
  accounts: ExternalUserAccount[]
}

export type GetExternalAccountListsApiConfig = AilabServerApiConfig<
  GetExternalAccountListsParams,
  GetExternalAccountListsResult
>
