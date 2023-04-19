import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { BreadcrumbProps } from '@hai-ui/core/lib/esm'
import { Breadcrumbs } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import { HFLayout, HFPageLayout } from '../../../../components/HFLayout'
import { GlobalContext } from '../../../../reducer/context'
import { XTopicBulletin } from '../../common-blocks/Bulletin'
import { XTopicPersona } from '../../common-blocks/Persona'

import './index.scss'
import { NotificationList } from './NotificationList'

export const XTopicAllNotifications = () => {
  const navigate = useNavigate()
  const globalContext = useContext(GlobalContext)
  const breadcrumbsItems: BreadcrumbProps[] = [
    { text: i18n.t(i18nKeys.biz_xtopic_nav), onClick: () => navigate('/topic'), icon: 'list' },
    { text: '全部通知', current: true },
  ]
  useEffectOnce(() => {
    globalContext.dispatchers.updateXTopicUser()
  })

  return (
    <HFPageLayout innerClassName="xtopic-container">
      <HFLayout className="xtopic-layout" direction="vertical">
        <div className="xtopic-breadcrumb-title">
          <Breadcrumbs className="xtopic-breadcrumbs" items={breadcrumbsItems} />
        </div>
        <div className="xtopic-wrapper">
          <div className="main">
            <NotificationList />
          </div>
          <div className="side">
            <XTopicPersona noNotification />
            <XTopicBulletin />
          </div>
        </div>
      </HFLayout>
    </HFPageLayout>
  )
}
