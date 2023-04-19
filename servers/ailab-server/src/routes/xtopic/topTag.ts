import type {
  XTopicTopTagInsertBody,
  XTopicTopTagListParams,
} from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { isXTopicAdmin } from '../../biz/xtopic/admin'
import { HFSequelize } from '../../orm'

type TagMeta =
  | {
      name: string
      pin: true
      order: number
      count: number
    }
  | {
      name: string
      pin: false
      count: number
    }

function register(router: Router) {
  router.post('/all', async (ctx, next) => {
    const hfSequelize = await HFSequelize.getInstance()

    const allWithTags = await hfSequelize.XTopicPosts.getAllTags()
    const allTags = allWithTags.map((item) => item.tags) as string[][]

    fillResponse(ctx, true, {
      allTags: [...new Set(allTags.flat())],
    })
    await next()
  })

  router.post('/list', async (ctx, next) => {
    // 支持搜索
    // 先选择所有 tag 出来，然后计算

    // 规则
    // 1. 没有搜索时，置顶标签排最前面
    // 2. 置顶组和普通组分别按数量排序
    // 3. 最多返回 MAX_RETURN_TAGS 个，多于 MAX_RETURN_TAGS ->  "...xxx 个标签未显示"
    // 4. 当有关键字的时候，无视置顶

    const MAX_RETURN_TAGS = 20

    const options = ctx.request.query as unknown as XTopicTopTagListParams
    const hfSequelize = await HFSequelize.getInstance()

    const allWithTags = await hfSequelize.XTopicPosts.getAllTags()

    const allTags = allWithTags.map((item) => item.tags) as string[][]
    const TagCounter = new Map<string, TagMeta>()

    if (options.keyword_pattern) {
      // 存在搜索关键字，从 allTags 里面搜索
      allTags.forEach((tags) => {
        tags.forEach((tag) => {
          if (!tag.toLowerCase().includes(options.keyword_pattern!.toLowerCase())) {
            return
          }
          if (!TagCounter.has(tag)) {
            TagCounter.set(tag, { count: 0, name: tag, pin: false })
          }
          const record = TagCounter.get(tag)
          record!.count += 1
        })
      })
    } else {
      // 不存在搜索关键字，预先设置置顶 tag
      const countAndRows = await hfSequelize.XTopicTopTag.list()
      countAndRows.rows.forEach((tagInfo) => {
        TagCounter.set(tagInfo.name, {
          count: 0,
          name: tagInfo.name,
          order: tagInfo.order,
          pin: true,
        })
      })
      allTags.forEach((tags) => {
        tags.forEach((tag) => {
          if (!TagCounter.has(tag)) {
            TagCounter.set(tag, {
              count: 0,
              name: tag,
              pin: false,
            })
          }
          const record = TagCounter.get(tag)
          record!.count += 1
        })
      })
    }

    // 处理计数
    let tags = [...TagCounter.entries()].map(([, record]) => record)
    tags.sort((a, b) => {
      if (a.pin !== b.pin) {
        // Number true->1 , false->0 , pin 在前面
        return -(Number(a.pin) - Number(b.pin))
      }
      if (a.pin && b.pin) {
        return a.order !== b.order
          ? // order 正序
            a.order - b.order
          : // count 倒序
            -(a.count - b.count)
      }
      return -(a.count - b.count)
    })

    let more = 0
    if (!options.showAll) {
      more = tags.length > MAX_RETURN_TAGS ? tags.length - MAX_RETURN_TAGS : 0
      tags = tags.slice(0, MAX_RETURN_TAGS)
    }

    fillResponse(ctx, true, {
      tags,
      more,
    })
    await next()
  })

  router.post('/insert', async (ctx, next) => {
    if (!isXTopicAdmin(ctx.request.headers.token as string)) {
      fillResponse(ctx, false, null, 'not allowed')
      return
    }
    const option = ctx.request.body as XTopicTopTagInsertBody
    const hfSequelize = await HFSequelize.getInstance()
    const basicItem = await hfSequelize.XTopicTopTag.insert(option)
    fillResponse(ctx, true, { basicItem })
    await next()
  })
}

export default register
