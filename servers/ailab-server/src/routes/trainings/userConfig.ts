import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/set_config_text', async (ctx, next) => {
    logger.info('ctx request body', ctx.request.body)
    if (!ctx.request.body.user_name) {
      fillResponse(ctx, false, null, 'user_name is required')
      await next()
      return
    }

    logger.info('set_config token', ctx.request.headers.token)

    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo || userInfo.user_name !== ctx.request.body.user_name) {
      fillResponse(ctx, false, null, 'not allowed')
      await next()
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    const settings = ctx.request.body.config_json as string
    hfSequelize.UserConfig.updateUserConfig(ctx.request.body.user_name as string, settings)

    fillResponse(ctx, true, true)
    await next()
  })

  router.get('/get_config_text', async (ctx, next) => {
    const userInfo = await getUserInfo(ctx.request.headers.token as string, ctx.request.headers)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'token not found')
      await next()
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    const settings = await hfSequelize.UserConfig.getUserConfig(userInfo.user_name)
    fillResponse(ctx, true, settings)
    await next()
  })
}

export default register
