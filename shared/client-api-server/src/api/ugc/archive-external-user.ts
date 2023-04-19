import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export interface ArchiveExternalUserParams extends ApiServerParams {
  user_name: string
  token: string
}

export type ArchiveExternalUserResult = null

export type ArchiveExternalUserConfig = ApiServerApiConfig<
  ArchiveExternalUserParams,
  ArchiveExternalUserResult
>
