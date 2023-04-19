import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { HFSequelize } from '../../orm'
import type { AppVersionAttributes } from '../../orm/models/AppVersion'

function register(router: Router) {
  router.post('/get_latest_app_version', async (ctx, next) => {
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, null, 'token not found')
      await next()
      return
    }

    const query = ctx.request.query as Pick<AppVersionAttributes, 'app_name' | 'base_app_version'>
    const hfSequelize = await HFSequelize.getInstance()
    const version = await hfSequelize.AppVersion.getAppVersion(
      query.app_name,
      query.base_app_version,
    )
    fillResponse(ctx, true, { version })
    await next()
  })
}

export default register
