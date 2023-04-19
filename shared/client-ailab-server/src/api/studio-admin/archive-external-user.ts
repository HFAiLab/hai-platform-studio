import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface ArchiveExternalUserParams extends AilabServerParams {
  user_name: string
}

export type ArchiveExternalUserResult = null

export type ArchiveExternalUserConfig = AilabServerApiConfig<
  ArchiveExternalUserParams,
  ArchiveExternalUserResult
>
