import type { XTopicPostSchema, XTopicUserPublicInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type XTopicListOrderKeys = 'createdAt' | 'heat'

export interface XTopicPostWithReplySchema
  extends Omit<XTopicPostSchema, 'createdAt' | 'updatedAt' | 'author'> {
  // 有一个总数就够了吧
  // replies: XTopicReplyCommentSchema[]

  repliesCount: number

  createdAt: string

  updatedAt: string

  nickname?: string | null

  // 有管理权限的可见
  author?: string

  userInfo?: XTopicUserPublicInfo
}

/**
 * 获取话题列表 的接口参数
 */
export interface XTopicPostListParams extends AilabServerParams {
  // 每页显示数量
  pageSize: number

  // 查询第几页
  page: number

  // 是否展示不可见的，管理员才能展示可见
  showHidden?: boolean

  // 是否按照指定属性排序
  orderBy?: XTopicListOrderKeys

  // 选择哪个板块的，没有的话就是 all
  category?: string | undefined

  // tag 列表
  tags: string[]

  // 搜索关键字
  keyword_pattern: string | undefined

  // 只看与我相关
  onlyAboutMe?: boolean
}

export interface XTopicPostListResult {
  count: number

  rows: XTopicPostWithReplySchema[]
}

export type XTopicPostListConfig = AilabServerApiConfig<XTopicPostListParams, XTopicPostListResult>
