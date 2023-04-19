import type {
  XTopicCarouselListParams,
  XTopicPostListParams,
  XTopicTopContentListParams,
  XTopicTopTagListParams,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button } from '@hai-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffectOnce } from 'react-use'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import { HFLayout, HFPageLayout } from '../../../../components/HFLayout'
import { HFPanel } from '../../../../components/HFPanel'
import { GlobalContext } from '../../../../reducer/context'
import { LevelLogger } from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { XTopicCarousel } from '../../common-blocks/Carousel'
import { XTopicPersona } from '../../common-blocks/Persona'
import { XTopicTagsFilter } from '../../common-blocks/TagsFilter'
import type { CombinePostsResult } from '../../schema/posts'
import { promptUpdateNickName } from '../../utils'
import { XTopicPostList } from './PostList'
import { XTopicTopContent } from './TopContent'

import './index.scss'

export const getXTopicPosts = async (
  params: XTopicPostListParams,
  fullTextSearchAvailable: boolean,
): Promise<CombinePostsResult> => {
  if (!params.keyword_pattern || !fullTextSearchAvailable) {
    const posts = await GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_POST_LIST, {
      ...params,
      page: params.page === -1 ? 0 : params.page,
    })
    return {
      type: 'flow',
      posts,
    }
  }

  const posts = await GlobalAilabServerClient.request(
    AilabServerApiName.XTOPIC_MEILI_SEARCH_BASIC_SEARCH,
    undefined,
    {
      data: {
        keyword: params.keyword_pattern,
        page: params.page,
        pageSize: params.pageSize,
      },
    },
  )

  return {
    type: 'search',
    posts,
  }
}

export const XTopicList = () => {
  const globalContext = useContext(GlobalContext)
  const { xTopicListPageState, xTopicUser } = globalContext.state
  const navigate = useNavigate()
  const [fullTextSearchAvailable, setFullTextSearchAvailable] = useState(false)

  const {
    data: combinePosts,
    refresh: refreshCombinePosts,
    status: combinePostsStatus,
    error: combinePostsError,
  } = useGroot({
    fetcher: getXTopicPosts,
    auto: false,
    swr: true, // 开启 swr 以减少闪烁
  })

  const { data: topTags } = useGroot({
    fetcher: (params: XTopicTopTagListParams) =>
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_TOP_TAG_LIST, params),
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  const { data: carousels } = useGroot({
    fetcher: (params: XTopicCarouselListParams) =>
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_CAROUSEL_LIST, params),
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  const { data: topContents, status: topContentsStatus } = useGroot({
    fetcher: (params: XTopicTopContentListParams) =>
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_TOP_CONTENT_LIST, params),
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  const ifNotReadyStatus = (status: GrootStatus) => {
    return !(status === GrootStatus.error || status === GrootStatus.success)
  }

  const checkInvokeNewPost = async () => {
    if (!xTopicUser || !xTopicUser.nickname) {
      const res = await promptUpdateNickName()
      if (res) {
        globalContext.dispatch([
          {
            type: 'xTopicListPageState',
            value: {
              ...xTopicListPageState,
              invokingNickNameEditor: true,
            },
          },
        ])
      }
      return
    }
    navigate('/topic/insert')
  }

  useEffectOnce(() => {
    globalContext.dispatchers.updateXTopicUser()
    return () => {
      LevelLogger.info('列表页析构')
    }
  })

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageXTopicMount)
    GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_MEILI_SEARCH_AVAILABLE, {}).then(
      (ret) => {
        setFullTextSearchAvailable(ret)
      },
    )
  })

  useEffect(() => {
    refreshCombinePosts(
      {
        page: xTopicListPageState.page - 1,
        pageSize: xTopicListPageState.pageSize,
        category: xTopicListPageState.category,
        tags: xTopicListPageState.tags,
        orderBy: xTopicListPageState.orderBy,
        keyword_pattern: xTopicListPageState.keyword,
        onlyAboutMe: xTopicListPageState.onlyAboutMe ? true : undefined,
      },
      fullTextSearchAvailable,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xTopicListPageState, fullTextSearchAvailable])

  return (
    <HFPageLayout innerClassName="xtopic-container" responsive>
      <HFLayout className="xtopic-layout" direction="vertical">
        <HFPanel className="dash-title-panel xtopic-title-panel" disableLoading>
          <h1>{i18n.t(i18nKeys.biz_xtopic_nav)}</h1>
          <p>
            这里是各位 AI 研究者、开发者可以自主发起讨论话题的交流社区
            <br />
            #集群使用疑问#、#平台功能建议#、#模型优化探讨#、#学术交流信息#……您的参与，会给更多人带来启发
          </p>
        </HFPanel>
        <div className="xtopic-wrapper">
          <div className="main">
            <XTopicTopContent
              topContents={topContents}
              skeleton={ifNotReadyStatus(topContentsStatus)}
            />
            <HFPanel disableLoading shadow className="xtopic-panel">
              <XTopicPostList
                fullTextSearchAvailable={fullTextSearchAvailable}
                refresh={refreshCombinePosts}
                postsStatus={combinePostsStatus}
                combinePosts={combinePosts}
                error={combinePostsError}
                skeleton={ifNotReadyStatus(combinePostsStatus)}
              />
            </HFPanel>
          </div>
          <div className="side">
            <XTopicPersona />
            <Button
              icon="plus"
              intent="primary"
              className="xtopic-invoke-new-btn"
              onClick={checkInvokeNewPost}
            >
              发起新话题
            </Button>
            <XTopicTagsFilter topTags={topTags} />
            {!!carousels?.list.length && <XTopicCarousel carousels={carousels} />}
          </div>
        </div>
      </HFLayout>
    </HFPageLayout>
  )
}
