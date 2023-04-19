import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type GetArchiveTaskLogParams = { task_id: number } & AilabServerParams

export type GetArchiveTaskLogResult = string

export type GetArchiveTaskLogConfig = AilabServerApiConfig<
  GetArchiveTaskLogParams,
  GetArchiveTaskLogResult
>
