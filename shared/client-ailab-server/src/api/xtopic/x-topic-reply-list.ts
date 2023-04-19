import type { XTopicReplySchema, XTopicUserPublicInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type ReferReplyMinimalInfo = Pick<XTopicReplySchema, 'floorIndex' | 'content'> & {
  userInfo?: XTopicUserPublicInfo | null | undefined
}

export interface XTopicReplyExtendedSchema
  extends Omit<XTopicReplySchema, 'createdAt' | 'updatedAt' | 'author'> {
  createdAt: string

  updatedAt: string

  nickname?: string | null

  // 有管理权限的可见
  author?: string

  userInfo?: XTopicUserPublicInfo | null

  referReply?: ReferReplyMinimalInfo

  isSelfReply?: boolean
}

/**
 * 获取话题回复列表 的接口参数
 */
export interface XTopicReplyListParams extends AilabServerParams {
  // 每页显示数量
  pageSize: number

  // 查询第几页
  page: number

  // 原始的帖子的 index
  postIndex: number
}

export interface XTopicReplyListResult {
  count: number

  rows: XTopicReplyExtendedSchema[]
}

export type XTopicReplyListConfig = AilabServerApiConfig<
  XTopicReplyListParams,
  XTopicReplyListResult
>
