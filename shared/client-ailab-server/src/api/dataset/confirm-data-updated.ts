import type { AilabServerApiConfig, AilabServerParams } from '../../types'

// ConfirmDataUpdated
export type DatasetConfirmDataUpdatedParams = AilabServerParams

export type DatasetConfirmDataUpdatedBody = { id: string }

/*
 * 用户确认上传完成，生成 dataVersion 返回结果是描述一则成功消息
 */
export type DatasetConfirmDataUpdatedResult = string

export type DatasetConfirmDataUpdatedConfig = AilabServerApiConfig<
  DatasetConfirmDataUpdatedParams,
  DatasetConfirmDataUpdatedResult,
  DatasetConfirmDataUpdatedBody
>
