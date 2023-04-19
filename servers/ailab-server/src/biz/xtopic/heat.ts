import type {
  XTopicPostExtendedSchema,
  XTopicPostWithReplySchema,
} from '@hai-platform/client-ailab-server'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { XTopicReply } from '../../orm/models/xtopic/Reply'
import { sleep } from '../../utils/promise'

/**
 *  热度计算的时机：因为相对会比较复杂，感觉不能每次请求的时候都算
 *      1. 有写操作的时候，触发一次热度计算：浏览、点赞、回复、回复点赞、PIN
 *          1.1 在操作之后去做，应该还好
 *      2. 热度计算的时候通过 Redis 分布式锁来保证原子性
 */
export const calculateHeat = (
  post: XTopicPostWithReplySchema | XTopicPostExtendedSchema,
  replyList: XTopicReply[],
) => {
  const { pv, pin } = post
  const replyCount = replyList.length

  let heat = 0

  // 浏览量 * 1
  heat += pv * 1

  // 回复数量 * 20
  heat += replyCount * 20

  const likeCountToHeat = (count: number) => {
    if (count <= 0) return 0
    if (count === 1) return 10
    return Math.floor((count - 1) / 10) * 1 + 10
  }

  // 问题/回答点赞（第1次 * 10，此后，每10次点赞 + 1）
  heat += likeCountToHeat(post.likeCount)
  replyList.forEach((reply) => {
    heat += likeCountToHeat(reply.likeCount)
  })

  // PIN + 100
  if (pin > 0) {
    heat += 100
  }

  return heat
}

export class HeatManager {
  // updateHeat: (postIndex: number) => void
  indexQueue: number[] = []

  batchUpdating = false

  // 更新热度是比较耗时的，需要考虑延迟处理
  async updateHeat(postIndex: number) {
    logger.info(`updateHeat index: ${postIndex}`)

    if (this.indexQueue.includes(postIndex)) return

    this.indexQueue.push(postIndex)

    // 延迟一段时间，如果这短时间内新的请求来了，是会共用一个 batchUpdateHeat
    await sleep(1000)

    this.batchUpdateHeat()
  }

  async batchUpdateHeat() {
    if (this.batchUpdating) return
    this.batchUpdating = true

    logger.info('batchUpdateHeat begin')

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const index = this.indexQueue.shift()
        logger.info(`batchUpdateHeat index: ${index}`)
        if (!index) break
        await this.updateHeatImpl(index)
      }
    } catch (e) {
      logger.error('batchUpdateHeat error:', e)
    }

    this.batchUpdating = false
  }

  async updateHeatImpl(postIndex: number) {
    const begin = performance.now()
    // do something

    const hfSequelize = await HFSequelize.getInstance()
    const postDetail = await hfSequelize.XTopicPosts.getXTopicPostsDetail(Number(postIndex), {})
    if (!postDetail) return

    const replyList = await hfSequelize.XTopicReply.getXTopicReplyAllList({ postIndex })

    const heat = calculateHeat(postDetail, replyList)
    await hfSequelize.XTopicPosts.update(postIndex, { heat })

    const cost = performance.now() - begin
    logger.info(`heat update, cost: ${cost}`)
  }
}

export const GlobalHeatManager = new HeatManager()
