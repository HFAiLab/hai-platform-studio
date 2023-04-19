import type { ApiServerApiConfig, ApiServerParams } from '../../types'

export interface UpdateUserGroupParams extends ApiServerParams {
  user_name: string
  groups: string[]
}

export interface UpdateUserGroupResult {
  msg?: string
}

export type UpdateUserGroupConfig = ApiServerApiConfig<UpdateUserGroupParams, UpdateUserGroupResult>
