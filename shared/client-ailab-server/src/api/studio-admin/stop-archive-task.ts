import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type StopArchiveTaskParams = { task_id: number } & AilabServerParams

export type StopArchiveTaskResult = null

export type StopArchiveTaskConfig = AilabServerApiConfig<
  StopArchiveTaskParams,
  StopArchiveTaskResult
>
