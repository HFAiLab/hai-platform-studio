import type { SocketControlDeleteTaskCacheBody } from '@hai-platform/client-ailab-server'
import stringifyInOrder from 'fst-stable-stringify'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { BFF_REDIS_KEYS } from '../../config'
import { bffRedisConn } from '../../redis'
import { Base64 } from '../../utils/base64'

function register(router: Router) {
  router.post('/delete_task_cache', async (ctx, next) => {
    const options = ctx.request.body as SocketControlDeleteTaskCacheBody
    const { paramsList } = options
    const userInfo = await getUserInfo(ctx.request.headers.token as string)!
    const bffRedis = await bffRedisConn.getClient()

    for (const params of paramsList) {
      const paramsKey = Base64.encode(stringifyInOrder(params))
      const taskRedisKey = `${BFF_REDIS_KEYS.socket_user_task_cache}:${
        userInfo!.user_name
      }:${paramsKey}`

      logger.info('delete_task_cache delete taskRedisKey:', taskRedisKey)
      await bffRedis.del(taskRedisKey)
    }

    fillResponse(ctx, true, undefined)
    await next()
  })
}

export default register
