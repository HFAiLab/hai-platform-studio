import { ApiServerApiName } from '@hai-platform/client-api-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { logger } from '../../base/logger'
import { GlobalApiServerClient } from '../../req/apiServer'

function register(router: Router) {
  router.post('/check_user', async (ctx, next) => {
    const query = ctx.request.body
    const { token } = query
    const { name } = query
    try {
      const userInfo = await GlobalApiServerClient.request(ApiServerApiName.GET_USER, {
        token,
      })
      fillResponse(ctx, true, {
        match: userInfo.user_name === name,
        token,
        name,
      })
    } catch (e) {
      logger.info('check_user error:', e)
      fillResponse(ctx, true, {
        match: false,
        token,
        name,
      })
    }

    await next()
  })
}

export default register
