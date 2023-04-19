import type Router from 'koa-router'
import { fillResponse } from '..'
import { axiosNoCache } from '../../base/axios'

function register(router: Router) {
  // /tasks 目前不需要了，删除

  router.post('/accessibility', async (ctx, next) => {
    const { url } = ctx.request.body
    try {
      const requestResult = await axiosNoCache({
        url,
        method: 'GET',
      })
      const canAccess = requestResult.status === 200
      fillResponse(ctx, true, {
        accessibility: canAccess,
      })
    } catch (e) {
      const message = `status: ${(e as any).status}`
      fillResponse(
        ctx,
        true,
        {
          accessibility: false,
        },
        message,
      )
    }
    await next()
  })
}

export default register
