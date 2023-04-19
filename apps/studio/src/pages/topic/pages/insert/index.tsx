import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { BreadcrumbProps } from '@hai-ui/core'
import { Breadcrumbs } from '@hai-ui/core'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffectOnce } from 'react-use'
import { HFLayout, HFPageLayout } from '../../../../components/HFLayout'
import { GlobalContext } from '../../../../reducer/context'
import { PostInsert } from './PostInsert'

import './index.scss'

export const XTopicInsert = () => {
  const navigate = useNavigate()
  const globalContext = useContext(GlobalContext)

  const breadcrumbsItems: BreadcrumbProps[] = [
    { text: i18n.t(i18nKeys.biz_xtopic_nav), onClick: () => navigate('/topic'), icon: 'list' },
    { text: '发起话题', current: true },
  ]

  useEffectOnce(() => {
    globalContext.dispatchers.updateXTopicUser()
  })

  return (
    <HFPageLayout innerClassName="xtopic-container" responsive>
      <HFLayout className="xtopic-layout" direction="vertical">
        <HFLayout className="xtopic-layout xtopic-insert-layout" direction="vertical">
          <div className="xtopic-breadcrumb-title insert-title">
            <Breadcrumbs className="xtopic-breadcrumbs" items={breadcrumbsItems} />
          </div>
          <div className="xtopic-insert-background" />
          <PostInsert />
        </HFLayout>
      </HFLayout>
    </HFPageLayout>
  )
}
