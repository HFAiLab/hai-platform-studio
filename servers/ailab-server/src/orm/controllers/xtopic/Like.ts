import type { XTopicLikeAddBody } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { Op } from 'sequelize'
import { XTopicLike, XTopicLikeInit } from '../../models/xtopic/Like'
import type { CommonSQLOptions } from '../schema'

export class XTopicLikeController {
  constructor(sequelize: Sequelize) {
    XTopicLikeInit(sequelize)
  }

  async insert(option: XTopicLikeAddBody) {
    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicLike.build(option)
    await basicItem.save()
    return basicItem
  }

  async addLike(option: XTopicLikeAddBody, sqlOptions?: CommonSQLOptions) {
    let likeItem = await XTopicLike.findOne({
      where: {
        contentType: option.contentType,
        itemUUID: option.itemUUID,
        username: option.username,
      },
    })
    if (!likeItem) {
      // @ts-expect-error because update
      likeItem = await XTopicLike.build({
        likeCount: 0,
      })
    }
    await likeItem.update(
      {
        likeCount: likeItem.likeCount + option.likeCount,
        contentType: option.contentType,
        itemUUID: option.itemUUID,
        username: option.username,
        itemIndex: option.itemIndex,
      },
      {
        transaction: sqlOptions?.transaction,
      },
    )
    return true
  }

  async countLikes(username: string) {
    const result = await XTopicLike.sum('likeCount', { where: { username } })
    return result
  }

  async countLikesByPostAndReplies(option: { postIndexes: number[]; replyIndexes: number[] }) {
    const result = await XTopicLike.sum('likeCount', {
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              {
                contentType: 'post',
              },
              {
                itemIndex: {
                  [Op.in]: option.postIndexes,
                },
              },
            ],
          },
          {
            [Op.and]: [
              {
                contentType: 'reply',
              },
              {
                itemIndex: {
                  [Op.in]: option.replyIndexes,
                },
              },
            ],
          },
        ],
      },
    })

    return result
  }
}
