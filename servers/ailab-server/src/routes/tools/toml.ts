import type { TomlParseBody, TomlStringifyBody } from '@hai-platform/client-ailab-server'
import type { JsonMap } from '@iarna/toml'
import TOML from '@iarna/toml'
import type Router from 'koa-router'
import { fillResponse } from '..'

function register(router: Router) {
  router.post('/parse', async (ctx, next) => {
    const body = ctx.request.body as TomlParseBody

    const results =
      body.content instanceof Array
        ? body.content.map((text) => TOML.parse(text))
        : TOML.parse(body.content)

    fillResponse(ctx, true, {
      results,
    })
    await next()
  })

  router.post('/stringify', async (ctx, next) => {
    const body = ctx.request.body as TomlStringifyBody

    const results =
      body.content instanceof Array
        ? body.content.map((text) => TOML.stringify(text as JsonMap))
        : TOML.stringify(body.content as JsonMap)

    fillResponse(ctx, true, {
      results,
    })
    await next()
  })
}

export default register
