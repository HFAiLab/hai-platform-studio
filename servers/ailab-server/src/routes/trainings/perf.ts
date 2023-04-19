import type { GetTaskCurrentPerfV2Params } from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getTaskCurrentPerf2 } from '../../biz/taskCurrentPerf'

function register(router: Router) {
  router.post('/get_task_current_perf_v2', async (ctx, next) => {
    const query = ctx.request.query as unknown as GetTaskCurrentPerfV2Params

    if (typeof query.keys === 'string') {
      query.keys = [query.keys]
    }

    const perfs = await getTaskCurrentPerf2(query)
    fillResponse(ctx, true, { perfs })
    await next()
  })
}

export default register
