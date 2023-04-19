import type { AilabServerApiConfig, AilabServerParams } from '../../types'

// AddMemo
export type DatasetAddMemoParams = AilabServerParams

export type DatasetAddMemoBody = { id: string; memo: string }

/*
 * 对数据集添加备注 返回结果是描述一则成功消息
 */
export type DatasetAddMemoResult = string

export type DatasetAddMemoConfig = AilabServerApiConfig<
  DatasetAddMemoParams,
  DatasetAddMemoResult,
  DatasetAddMemoBody
>
