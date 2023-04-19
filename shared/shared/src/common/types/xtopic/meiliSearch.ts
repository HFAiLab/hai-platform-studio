import type { XTopicPostSchema, XTopicReplySchema } from './item'

/**
 * meili-search 返回的 result 内容
 */
export interface MeiliSearchResult<T> {
  // 全部命中的数量
  count: number

  hits: T[]

  limit: number

  offset: number

  query: string
}

/**
 * meili-search 针对 XTopic 的 回复 schema
 */
export interface MeiliXTopicReply extends Partial<XTopicReplySchema> {
  nickname: string | null
}

/**
 * meili-search 针对 XTopic 的 话题 schema
 */
export interface MeiliXTopicPost extends Partial<XTopicPostSchema> {
  /**
   * 由于我们的搜索内容可能会有不同来源，单一的 uuid 是不稳定的，我们根据各自的情况，组合一个 rowKey
   * 另外 rowkey 前缀也可以作为一个 type 的区分
   */
  rowkey: string

  nickname: string | null

  replies: MeiliXTopicReply[]

  /**
   * 因为后面可能支持多种不同的来源，可能其他来源的格式就不一样了
   */
  richType: 'xtopic_post'
}

export type XTopicMeiliSearchResultPost = MeiliXTopicPost & { _formatted: MeiliXTopicPost }

export type XTopicMeiliSearchResult = MeiliSearchResult<XTopicMeiliSearchResultPost>
