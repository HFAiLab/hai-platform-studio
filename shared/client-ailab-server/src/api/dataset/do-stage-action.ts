import type { AilabServerApiConfig, AilabServerParams } from '../../types'

// DoStageAction
export type DatasetDoStageActionParams = AilabServerParams

export type DatasetDoStageActionBody = { id: string; stage: string }

/*
 * 执行该 stage 的动作 返回结果是描述一则成功消息
 */
export type DatasetDoStageActionResult = string

export type DatasetDoStageActionConfig = AilabServerApiConfig<
  DatasetDoStageActionParams,
  DatasetDoStageActionResult,
  DatasetDoStageActionBody
>
