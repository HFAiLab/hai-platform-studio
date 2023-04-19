import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Tab, Tabs } from '@hai-ui/core/lib/esm'
import React, { useState } from 'react'
import type { TabItem } from '../../../../components/VerticalTab'
import { MassSendingMain } from './MassSending'
import { TriggerManager } from './Triggers'

import './index.scss'

const Content = () => {
  const [selectedTab, setSelectedTab] = useState<string>('massSending')

  return (
    <div>
      <Tabs selectedTabId={selectedTab} onChange={(id) => setSelectedTab(id as string)}>
        <Tab id="massSending" title="通知群发" />
        <Tab id="triggers" title="自动通知触发器设置" />
        {}
      </Tabs>
      <div className="xtopic-admin-container">
        {selectedTab === 'massSending' && <MassSendingMain />}
        {selectedTab === 'triggers' && <TriggerManager />}
        {}
      </div>
    </div>
  )
}

export const XTopicTab = {
  icon: 'chat',
  title: 'XTopic',
  content: <Content />,
  displayTitle: i18n.t(i18nKeys.biz_xtopic_nav),
} as TabItem
