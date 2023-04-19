import type { XTopicCategoryInsertBody } from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const hfSequelize = await HFSequelize.getInstance()
    const list = await hfSequelize.XTopicCategory.list()
    fillResponse(ctx, true, { list })
    await next()
  })

  router.post('/insert', async (ctx, next) => {
    const option = ctx.request.body as XTopicCategoryInsertBody
    const hfSequelize = await HFSequelize.getInstance()
    const basicItem = await hfSequelize.XTopicCategory.insert(option)
    fillResponse(ctx, true, { basicItem })
    await next()
  })
}

export default register
