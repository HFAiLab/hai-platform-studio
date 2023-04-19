import type {
  XTopicReplyExtendedSchema,
  XTopicReplyInsertBody,
  XTopicReplyListParams,
  XTopicReplyListResult,
} from '@hai-platform/client-ailab-server'
import type { XTopicReplySchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../../../base/logger'
import { GlobalXTopicUserInfoManager } from '../../../biz/xtopic/userInfo'
import { XTopicReply, XTopicReplyInit } from '../../models/xtopic/Reply'
import type { CommonSQLOptions } from '../schema'

export interface XTopicGetReplyListExternalOptions {
  requestUserName?: string | null | undefined
  keepAuthor?: boolean
}

export class XTopicReplyController {
  constructor(sequelize: Sequelize) {
    XTopicReplyInit(sequelize)
  }

  async getXTopicReplyList(
    option: XTopicReplyListParams,
    external_options: XTopicGetReplyListExternalOptions = {},
  ) {
    if (Number.isNaN(Number(option.postIndex))) return []

    // 所有的 item 先查出来
    const itemList = (await XTopicReply.findAndCountAll({
      where: {
        postIndex: option.postIndex,
        visible: true,
        deleted: false,
      },
      order: [['index', 'asc']],
      distinct: true,
      raw: true,
    })) as unknown as XTopicReplyListResult

    const itemListMap: Map<number, XTopicReplyExtendedSchema> = new Map()
    itemList.rows.forEach((item) => {
      itemListMap.set(item.index, item)
    })

    await GlobalXTopicUserInfoManager.syncFromDB()

    const itemListThisPage = itemList.rows.slice(
      option.page * option.pageSize,
      option.page * option.pageSize + option.pageSize,
    )

    itemListThisPage.forEach((item) => {
      // @ts-expect-error 上面 schema 不好写，此时还有 author
      item.nickname = GlobalXTopicUserInfoManager.getNickNameByUserName(item.author)
      //  @ts-expect-error just ignore
      item.userInfo = GlobalXTopicUserInfoManager.getUserInfoByUserName(item.author)

      if (external_options.requestUserName)
        item.isSelfReply = item.author === external_options.requestUserName

      if (!external_options.keepAuthor) {
        delete item.author
      }

      if (item.referReplyIndex) {
        const referItem = itemListMap.get(item.referReplyIndex)
        if (!referItem) return
        if (!referItem?.userInfo) {
          //  @ts-expect-error just ignore
          referItem.userInfo = GlobalXTopicUserInfoManager.getUserInfoByUserName(referItem.author)
        }
        if (referItem) {
          item.referReply = {
            floorIndex: referItem.floorIndex,
            content: referItem.content,
            userInfo: referItem.userInfo,
          }
        }
      }
    })

    // 现在我采用一个方案：
    //    1. 全部获取所有回帖，以 floorIndex 为 key 作为 map
    //    2. 找到对应页数的
    //    4. 补充 userInfo

    // referReply 的内容？

    return {
      count: itemList.count,
      rows: itemListThisPage,
    }
  }

  // 获取所有的评论，内部使用的时候用的，外部不用
  async getXTopicReplyAllList(option: { postIndex: number }) {
    if (Number.isNaN(Number(option.postIndex))) return []

    const itemList = await XTopicReply.findAll({
      where: {
        postIndex: option.postIndex,
        visible: true,
        deleted: false,
      },
    })
    return itemList
  }

  async getXTopicReplyDetail(option: { replyIndex: number }) {
    if (Number.isNaN(Number(option.replyIndex))) return null

    const item = await XTopicReply.findOne({
      where: {
        index: option.replyIndex,
      },
    })
    return item
  }

  // 通知用：只拿 reply 的 author 和 postIndex
  async getReplyMeta(index: number) {
    if (Number.isNaN(Number(index))) return null

    const result = (await XTopicReply.findOne({
      attributes: ['author', 'postIndex'],
      where: { index, deleted: false },
    })) as { author: string; postIndex: number }
    return result ?? null
  }

  async insert(option: XTopicReplyInsertBody, sqlOptions?: CommonSQLOptions) {
    const floors = await XTopicReply.count({
      where: {
        postIndex: option.postIndex,
      },
      transaction: sqlOptions?.transaction,
    })

    const insertOptions = {
      ...option,
      floorIndex: floors + 1,
      uuid: uuidv4(),
    }

    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicReply.build(insertOptions)
    await basicItem.save({
      transaction: sqlOptions?.transaction,
    })
    return basicItem
  }

  // 最简单的更新：只更新上传的那些字段
  async update(index: number, option: Partial<XTopicReplySchema>) {
    await XTopicReply.update(option, {
      where: {
        index,
      },
    })
    return true
  }

  // 点赞
  async addLike(index: number, likeNumber: number, sqlOptions?: CommonSQLOptions) {
    await XTopicReply.increment('likeCount', {
      by: likeNumber,
      where: {
        index,
      },
      transaction: sqlOptions?.transaction,
    })
    return true
  }

  async countReplies(author: string) {
    const result = await XTopicReply.findAndCountAll({
      attributes: ['index'],
      where: {
        author,
        visible: true,
        deleted: false,
      },
    })
    return result
  }
  // async setVisible(index: number, visible: boolean) {
  // }

  // async delete(index: number) {
  // }

  async delete(index: number) {
    if (Number.isNaN(Number(index))) return null

    logger.warn(`[XTOPIC] delete reply: ${index}`)
    const result = await XTopicReply.update(
      {
        deleted: true,
      },
      {
        where: { index },
      },
    )
    return result
  }
}
