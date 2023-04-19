import type { XTopicContentType } from './common'

/**
 * 话题的点赞 Schema
 */
export interface XTopicLikeSchema {
  id: number

  // 举报的内容类型：帖子/回帖/回帖的评论
  contentType: XTopicContentType

  // 帖子的 index，也相当于表 id
  itemIndex: number

  // 帖子/回帖/回帖的评论 的 id
  itemUUID: string

  // 点赞的人
  username: string

  // 点赞数量
  likeCount: number

  updatedAt: Date

  createdAt: Date
}
