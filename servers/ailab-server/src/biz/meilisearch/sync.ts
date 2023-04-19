import type { MeiliXTopicPost } from '@hai-platform/shared'
import markdownToTxt from 'markdown-to-txt'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { XTopicPost } from '../../orm/models/xtopic/Post'
import type { XTopicReply } from '../../orm/models/xtopic/Reply'
import { GlobalXTopicUserInfoManager } from '../xtopic/userInfo'
import { GlobalMeiliSearchClient, MeiliIndexConsts } from './config'
import { MeiliRowKey } from './rowKey'

export const meiliSearchSyncXTopicPost = async () => {
  if (!GlobalMeiliSearchClient) {
    return {
      timeCost: 0,
      count: 0,
    }
  }
  const timeBegin = Date.now()
  const hfSequelize = await HFSequelize.getInstance()
  const allPosts = await hfSequelize.XTopicPosts.getXTopicAllPosts()

  logger.info('[meili-search] sync search begin, allPosts:', allPosts.length)

  const xtopicSearchIndex = GlobalMeiliSearchClient.index(MeiliIndexConsts.XTOPIC)

  const skippedPosts: MeiliXTopicPost[] = []

  for (const post of allPosts) {
    const skippedContent = markdownToTxt(post.content)
    await GlobalXTopicUserInfoManager.syncFromDB()
    const replies = ((post as unknown as any).replies as XTopicReply[]).map((reply) => {
      return {
        floorIndex: reply.floorIndex,
        nickname: GlobalXTopicUserInfoManager.getNickNameByUserName(reply.author),
        content: markdownToTxt(reply.content),
        createdAt: reply.createdAt,
      }
    })

    skippedPosts.push({
      rowkey: MeiliRowKey.getRowKeyFromXTopicPost(post),
      uuid: post.uuid,
      index: post.index,
      title: post.title,
      richType: 'xtopic_post',
      nickname: GlobalXTopicUserInfoManager.getNickNameByUserName(post.author),
      content: skippedContent,
      createdAt: post.createdAt,
      tags: post.tags,
      replies,
    })
  }

  /**
   * hint:
   * 这里不能调用 delete 或者 deleteAllDocuments
   * delete 可能会导致如果立刻请求的话 500
   */
  // await xtopicSearchIndex.delete()

  /**
   * 更新搜索字段，权重从轻到重
   */
  xtopicSearchIndex.updateSearchableAttributes(['title', 'content', 'author', 'replies'])

  /**
   * 我们设定了 index 为索引，那么同样的 index 重复插入会被覆盖
   * hint: 这里其实遗留一个优化，就是可以增量地去更新这个 posts，但是现在考虑耗时不长，暂时就先不增量更新了
   */
  const addRes = await xtopicSearchIndex.addDocuments(skippedPosts, {
    primaryKey: 'rowkey',
  })
  logger.info(`[meili-search] sync xtopic posts, res`, addRes)

  const timeCost = Date.now() - timeBegin
  logger.info(`[meili-search] sync xtopic posts, time cost: ${timeCost}`)

  return {
    timeCost,
    count: allPosts.length,
  }
}

/**
 * 删除一个文档的索引
 */
export const meiliSearchDeleteXTopicPost = async (post: XTopicPost) => {
  if (!GlobalMeiliSearchClient) {
    return
  }
  const xtopicSearchIndex = GlobalMeiliSearchClient.index(MeiliIndexConsts.XTOPIC)
  /**
   * 通过传递我们的主键，可以删除一个文档
   */
  await xtopicSearchIndex.deleteDocument(MeiliRowKey.getRowKeyFromXTopicPost(post))
}
