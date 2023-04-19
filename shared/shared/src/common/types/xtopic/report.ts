import type { XTopicContentType } from './common'

/**
 * 话题的举报 Schema
 */
export interface XTopicReportSchema {
  id: number

  // 举报的内容类型：帖子/回帖/回帖的评论
  contentType: XTopicContentType

  // 举报做得好的话，应该还得有一个 reportType

  // 举报的 index
  itemIndex: number

  // 举报的 帖子/回帖/回帖的评论 的 id
  itemUUID: string

  // 举报内容
  reason: string

  // 举报提交人
  submitter: string

  updatedAt: Date

  createdAt: Date
}
