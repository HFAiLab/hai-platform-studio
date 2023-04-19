import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Breadcrumbs } from '@hai-ui/core'
import type { BreadcrumbProps } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffectOnce } from 'react-use'
import { HFLayout, HFPageLayout } from '../../../../components/HFLayout'
import { GlobalContext } from '../../../../reducer/context'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { PostDetail } from './PostDetail'

import './index.scss'

export const XTopicDetail = () => {
  const navigate = useNavigate()
  const globalContext = useContext(GlobalContext)

  const breadcrumbsItems: BreadcrumbProps[] = [
    { text: i18n.t(i18nKeys.biz_xtopic_nav), onClick: () => navigate('/topic'), icon: 'list' },
    { text: '话题详情', current: true },
  ]

  useEffectOnce(() => {
    globalContext.dispatchers.updateXTopicUser()
  })

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.XTopicDetailOpen)
  })

  return (
    <HFPageLayout innerClassName="xtopic-container" responsive>
      <HFLayout className="xtopic-layout" direction="vertical">
        <div className="xtopic-breadcrumb-title">
          <Breadcrumbs className="xtopic-breadcrumbs" items={breadcrumbsItems} />
        </div>
        <PostDetail />
      </HFLayout>
    </HFPageLayout>
  )
}
