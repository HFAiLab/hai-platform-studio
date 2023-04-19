import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type GetAllInternalExternalUserNameParams = AilabServerParams

export type GetAllInternalExternalUserNameResult = {
  external: string[]
  internal: string[]
}

export type GetAllInternalExternalUserNameApiConfig = AilabServerApiConfig<
  GetAllInternalExternalUserNameParams,
  GetAllInternalExternalUserNameResult
>
