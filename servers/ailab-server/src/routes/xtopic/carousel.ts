import type Router from 'koa-router'
import { fillResponse } from '..'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const hfSequelize = await HFSequelize.getInstance()
    const list = await hfSequelize.xTopicCarousel.list()
    fillResponse(ctx, true, { list })
    await next()
  })
}

export default register
