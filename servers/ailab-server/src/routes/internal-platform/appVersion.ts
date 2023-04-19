import type Router from 'koa-router'
import { fillResponse } from '..'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { AppVersionAttributes } from '../../orm/models/AppVersion'

const SET_APP_VERSION_ACCESS_TOKEN = '30050fe2-7e9d-40b8-8452-c0a8d073a850'

function register(router: Router) {
  router.post('/set_latest_app_version', async (ctx, next) => {
    const body = ctx.request.body as Pick<
      AppVersionAttributes,
      'app_name' | 'base_app_version' | 'latest_app_version'
    >
    const access_token = ctx.request.body.access_token as string

    logger.info(`set_latest_app_version: ${access_token}`, body)

    if (access_token !== SET_APP_VERSION_ACCESS_TOKEN) {
      fillResponse(ctx, false, false)
      await next()
      return
    }

    const hfSequelize = await HFSequelize.getInstance()
    hfSequelize.AppVersion.updateAppVersion(
      body.app_name,
      body.base_app_version,
      body.latest_app_version,
    )

    fillResponse(ctx, true, true)
    await next()
  })
}

export default register
