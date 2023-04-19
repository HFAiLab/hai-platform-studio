import type {
  XTopicPostExtendedSchema,
  XTopicPostInsertBody,
  XTopicPostListParams,
  XTopicPostSuggestListParams,
  XTopicPostWithReplySchema,
} from '@hai-platform/client-ailab-server'
import type { XTopicPostSchema } from '@hai-platform/shared'
import type { Order, WhereOptions } from 'sequelize'
import { Op, Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../../../base/logger'
import { GlobalXTopicUserInfoManager } from '../../../biz/xtopic/userInfo'
import { XTopicPost, XTopicPostInit } from '../../models/xtopic/Post'
import { XTopicReply } from '../../models/xtopic/Reply'
import type { CommonSQLOptions } from '../schema'

export interface XTopicGetPostDetailOptions {
  // 是谁请求的，如果有这个信息的话会返回是不是自己创建的
  requestUserName?: string | null | undefined

  // 是否携带 reply 的信息
  withReplies?: boolean

  // 是否保留 Author 字段
  keepAuthor?: boolean
}

export interface XTopicGetPostsListExternalOptions {
  requestUserName?: string | null | undefined
  keepAuthor?: boolean
}

export class XTopicPostController {
  constructor(sequelize: Sequelize) {
    XTopicPostInit(sequelize)
  }

  async getXTopicPostsList(
    option: XTopicPostListParams,
    external_options: XTopicGetPostsListExternalOptions = {},
  ) {
    const order: Order = [['pin', 'desc']]

    if (!option.orderBy) {
      order.push(['index', 'desc'])
    } else {
      order.push([option.orderBy, 'desc'])
    }

    const query: WhereOptions<XTopicPostSchema> = {
      visible: true,
      deleted: false,
    }

    if (option.showHidden) {
      delete query.visible
    }

    if (option.keyword_pattern) {
      query.title = {
        //  [Op.substring]: 'hat',  // LIKE '%hat%'
        [Op.substring]: option.keyword_pattern || '',
      }
    }

    if (option.tags) {
      // @ts-expect-error ignore schema error: pgsql 本身应该是支持这种 overlap 写法的
      query.tags = {
        [Op.overlap]: typeof option.tags === 'string' ? [option.tags] : option.tags,
      }
    }

    if (option.onlyAboutMe) {
      // 只看与我相关的
      // 我点赞的
      // 我评论的
      // 我发布的

      const userName = external_options.requestUserName

      if (!userName)
        return {
          rows: [],
          count: 0,
        }

      const postIndexes = await XTopicPost.findAll({
        attributes: ['index'],
        where: {
          author: userName,
          visible: true,
          deleted: false,
        },
        raw: true,
      })

      const replyIndexes = await XTopicReply.findAll({
        attributes: ['postIndex'],
        where: {
          author: userName,
          visible: true,
          deleted: false,
        },
        raw: true,
      })

      // hint: 暂时不认为点赞是与我相关
      // const likePostIndex = await XTopicLike.findAll({
      //   attributes: ['itemIndex'],
      //   where: {
      //     username: userName,
      //     contentType: 'post',
      //   },
      //   raw: true,
      // })

      const allIndexes = new Set([
        ...postIndexes.map((item) => item.index),
        ...replyIndexes.map((item) => item.postIndex),
        // ...likePostIndex.map((item) => item.itemIndex),
      ])

      query.index = {
        [Op.in]: [...allIndexes],
      }
    }

    const itemList = await XTopicPost.findAndCountAll({
      where: query,
      order,
      offset: option.page * option.pageSize,
      limit: option.pageSize,
      // include: XTopicReply,
      include: {
        model: XTopicReply,
        required: false,
        where: {
          visible: true,
          deleted: false,
        },
      },
      distinct: true, // 去重，返回的 count 不把 include 的东西算进去
    })

    const rows = itemList.rows.map((item) => {
      const plainItems = item.get({ plain: true })
      // @ts-expect-error ignore
      plainItems.repliesCount = item.replies.length
      // @ts-expect-error ignore
      delete plainItems.replies
      return plainItems as unknown as XTopicPostWithReplySchema
    }) as XTopicPostWithReplySchema[]

    await GlobalXTopicUserInfoManager.syncFromDB()

    rows.forEach((item) => {
      // @ts-expect-error 上面 schema 不好写，此时还有 author
      item.nickname = GlobalXTopicUserInfoManager.getNickNameByUserName(item.author)
      if (!external_options.keepAuthor) {
        delete item.author
      }
    })

    return {
      rows,
      count: itemList.count,
    }
  }

  async getSuggestList(option: XTopicPostSuggestListParams) {
    const order: Order = [
      ['pin', 'desc'],
      ['heat', 'desc'],
    ]

    let query: WhereOptions<XTopicPostSchema> = {
      visible: true,
      deleted: false,
    }

    if (option.keyword_pattern) {
      const keyword = /^[0-9]+$/.test(option.keyword_pattern)
        ? Number(option.keyword_pattern)
        : `${option.keyword_pattern}`

      if (typeof keyword === 'number') {
        query = {
          [Op.or]: [
            {
              title: {
                [Op.substring]: `${keyword}` || '',
              },
            },
            {
              index: keyword,
            },
          ],
          ...query,
        }
      } else {
        query.title = {
          [Op.substring]: `${keyword}` || '',
        }
      }
    }

    const itemList = await XTopicPost.findAll({
      where: query,
      order,
      limit: 10, // default suggest list
      attributes: ['index', 'title'],
    })

    return itemList
  }

  async getXTopicPostsDetail(index: number, options: XTopicGetPostDetailOptions) {
    if (Number.isNaN(Number(index))) return null

    const item = (await XTopicPost.findOne({
      where: {
        index,
        deleted: false,
        visible: true,
      },
      raw: true,
    })) as unknown as XTopicPostExtendedSchema
    await GlobalXTopicUserInfoManager.syncFromDB()

    if (!item) return null

    // @ts-expect-error 上面 schema 不好写，此时还有 author
    item.nickname = GlobalXTopicUserInfoManager.getNickNameByUserName(item.author)

    item.userInfo = GlobalXTopicUserInfoManager.getUserInfoByUserName(item.author)

    if (options.requestUserName) item.isSelfPost = item.author === options.requestUserName

    if (!options.keepAuthor) {
      // @ts-expect-error 上面 schema 不好写，此时还有 author
      delete item.author
    }
    return item
  }

  async getAllTags() {
    const tags = await XTopicPost.findAll({
      attributes: ['tags'],
      where: {
        visible: true,
        deleted: false,
      },
    })
    return tags
  }

  async getXTopicBlogPosts() {
    const blogPosts = await XTopicPost.findAll({
      raw: true,
      where: {
        visible: true,
        deleted: false,
        blogName: {
          [Op.not]: null,
        },
      },
    })

    return blogPosts
  }

  // 获取所有的话题以及他们的评论
  async getXTopicAllPosts() {
    const blogPosts = await XTopicPost.findAll({
      where: {
        visible: true,
        deleted: false,
      },
      include: {
        model: XTopicReply,
        required: false,
        where: {
          visible: true,
          deleted: false,
        },
      },
    })

    return blogPosts
  }

  async getAllBlogNames() {
    const blogNames = await XTopicPost.findAll({
      attributes: ['blogName'],
      where: {
        visible: true,
        deleted: false,
      },
    })
    return blogNames.map((item) => item.blogName)
  }

  async insert(option: XTopicPostInsertBody) {
    const insertOptions = {
      ...option,
      uuid: uuidv4(),
    }

    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicPost.build(insertOptions)
    await basicItem.save()
    return basicItem
  }

  // 有则改之，无则新增
  // 安全的编码原则：不显式地使用删除操作
  async insertBlog(row: XTopicPostInsertBody, sqlOptions?: CommonSQLOptions) {
    if (!row.blogName) {
      throw new Error('blogName is empty')
    }

    const rowWithUUID = {
      ...row,
      uuid: uuidv4(),
    }

    const blogPost = await XTopicPost.findOne({
      where: {
        blogName: row.blogName,
      },
      transaction: sqlOptions?.transaction,
    })

    // hint: 这里由于 blogName 字段非主键，不要用 upsert
    if (!blogPost) {
      // @ts-expect-error because 暂时宽松处理
      await XTopicPost.create(rowWithUUID, {
        transaction: sqlOptions?.transaction,
      })
    } else {
      if (row.createdAt) {
        blogPost.changed('createdAt', true)
        blogPost.set('createdAt', row.createdAt, { raw: true })
      }
      await blogPost.update(
        {
          ...row,
        },
        {
          silent: true,
          transaction: sqlOptions?.transaction,
        },
      )
    }
    return true
  }

  // 最简单的更新：只更新上传的那些字段
  async update(index: number, option: Partial<XTopicPostSchema>) {
    const basicItem = await XTopicPost.findOne({
      where: {
        index,
      },
    })
    if (!basicItem) return false
    await basicItem.update(option)
    return true
  }

  async addPV(index: number) {
    await XTopicPost.increment('pv', {
      by: 1,
      where: {
        index,
        deleted: false,
        visible: true,
      },
    })
    return true
  }

  async updateRepliedAt(index: number, sqlOptions?: CommonSQLOptions) {
    await XTopicPost.update(
      {
        lastRepliedAt: new Date(),
      },
      {
        where: {
          index,
        },
        transaction: sqlOptions?.transaction,
      },
    )
    return true
  }

  // 点赞
  async addLike(index: number, likeNumber: number, sqlOptions?: CommonSQLOptions) {
    await XTopicPost.increment('likeCount', {
      by: likeNumber,
      where: {
        index,
      },
      transaction: sqlOptions?.transaction,
    })
    return true
  }

  async countPosts(author: string) {
    const result = await XTopicPost.findAndCountAll({
      attributes: ['index'],
      where: { author, visible: true, deleted: false },
    })
    return result
  }

  // async setVisible(index: number, visible: boolean) {
  // }

  async delete(index: number) {
    if (Number.isNaN(Number(index))) return null

    logger.warn(`[XTOPIC] delete post: ${index}`)

    const item = await XTopicPost.findOne({
      raw: true,
      where: { index },
    })

    await XTopicPost.update(
      {
        deleted: true,
      },
      {
        where: { index },
      },
    )

    return item
  }

  // 通知用：只拿 post 的 author 和 title
  async getPostMeta(index: number, includeDeleted = false) {
    if (Number.isNaN(Number(index))) return null

    const query: WhereOptions<XTopicPostSchema> = {
      index,
    }
    if (!includeDeleted) {
      query.deleted = false
    }

    const result = (await XTopicPost.findOne({
      attributes: ['author', 'title'],
      where: query,
    })) as { author: string; title: string }
    return result ?? null
  }

  // 外部用户活跃统计用，group 出所有人的发帖数量
  async getUsersPostCount() {
    const query: WhereOptions<XTopicPostSchema> = {
      deleted: false,
    }
    const result = (await XTopicPost.findAll({
      where: query,
      group: 'author',
      attributes: ['author', [Sequelize.fn('COUNT', Sequelize.col('index')), 'n_posts']],
      raw: true,
    })) as unknown as Array<{
      author: string
      n_posts: number
    }>
    return result ?? null
  }
}
