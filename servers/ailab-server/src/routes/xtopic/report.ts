import type { XTopicReportInsertBody } from '@hai-platform/client-ailab-server'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { ImportantInfoTypes, serverMonitor } from '../../monitor'
import { HFSequelize } from '../../orm'

function register(router: Router) {
  router.post('/list', async (ctx, next) => {
    const hfSequelize = await HFSequelize.getInstance()
    const list = await hfSequelize.xTopicReport.list()
    fillResponse(ctx, true, { list })
    await next()
  })

  router.post('/insert', async (ctx, next) => {
    const option = ctx.request.body as XTopicReportInsertBody
    const hfSequelize = await HFSequelize.getInstance()
    const basicItem = await hfSequelize.xTopicReport.insert(option)
    serverMonitor.reportV2Public({
      keyword: ImportantInfoTypes.xTopicReport,
      content: `[看板] ${option.submitter} 提交了一条举报，请及时查看`,
    })

    fillResponse(ctx, true, { basicItem })
    await next()
  })
}

export default register
