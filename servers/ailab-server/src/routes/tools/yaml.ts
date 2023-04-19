import type { YamlParseBody, YamlStringifyBody } from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import YAML from 'yaml'
import { fillResponse } from '..'

function register(router: Router) {
  router.post('/parse', async (ctx, next) => {
    const body = ctx.request.body as YamlParseBody

    const results =
      body.content instanceof Array
        ? body.content.map((text) => YAML.parse(text))
        : YAML.parse(body.content)

    fillResponse(ctx, true, {
      results,
    })
    await next()
  })

  router.post('/stringify', async (ctx, next) => {
    const body = ctx.request.body as YamlStringifyBody

    const results =
      body.content instanceof Array
        ? body.content.map((text) => YAML.stringify(text))
        : YAML.stringify(body.content)

    fillResponse(ctx, true, {
      results,
    })
    await next()
  })
}

export default register
