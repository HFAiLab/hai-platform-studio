import type { XTopicMeiliSearchBasicSearchBody } from '@hai-platform/client-ailab-server'
import { MeiliHighlightPostTag, MeiliHighlightPreTag } from '@hai-platform/shared'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { logger } from '../../base/logger'
import { GlobalMeiliSearchClient, MeiliIndexConsts } from '../../biz/meilisearch/config'
import { meiliSearchSyncXTopicPost } from '../../biz/meilisearch/sync'

function register(router: Router) {
  router.post('/sync_search', async (ctx, next) => {
    const syncRes = await meiliSearchSyncXTopicPost()
    fillResponse(ctx, true, syncRes)
    await next()
  })

  router.post('/basic_search', async (ctx, next) => {
    const options = ctx.request.body as unknown as XTopicMeiliSearchBasicSearchBody
    const { keyword, pageSize, page } = options
    logger.info(
      `[${GlobalMeiliSearchClient ? 'meili' : 'simple'}-search] basic search, keyword:`,
      keyword,
    )
    let result
    if (GlobalMeiliSearchClient) {
      const xtopicSearchIndex = GlobalMeiliSearchClient.index(MeiliIndexConsts.XTOPIC)
      const searchResult = await xtopicSearchIndex.search(keyword, {
        highlightPreTag: MeiliHighlightPreTag,
        highlightPostTag: MeiliHighlightPostTag,
        offset: page * pageSize,
        limit: pageSize,
        attributesToHighlight: ['*'],
      })

      result = {
        ...searchResult,
        count: searchResult.estimatedTotalHits,
      }

      delete result.estimatedTotalHits
    } else {
      // 当没有 MeiliSearch 服务时，返回一个空结果
      result = {
        count: 0,
        hits: [],
        limit: pageSize,
        offset: 0,
        processingTimeMs: 0,
        query: keyword,
      }
    }
    fillResponse(ctx, true, result)
    await next()
  })

  router.post('/available', async (ctx, next) => {
    fillResponse(ctx, true, Boolean(GlobalMeiliSearchClient))
    await next()
  })
}

export default register
