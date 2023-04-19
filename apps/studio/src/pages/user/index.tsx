import { i18n, i18nKeys } from '@hai-platform/i18n'
import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import { HFLayout, HFPageLayout } from '../../components/HFLayout'
import { HFPanel } from '../../components/HFPanel'
import type { TabItem } from '../../components/VerticalTab'
import { VerticalTab } from '../../components/VerticalTab'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { SettingsContainer } from '../settings/biz-comps/index'
import { AccessManager } from './biz-comps/AccessManager'
import { BasicSetting } from './biz-comps/BasicSetting'

import './index.scss'

enum SettingTabs {
  USER_INFO = 'User Info',
  SETTINGS = 'Settings',
  TOPIC = 'Topic',
}

export const UserPage = () => {
  const [activeTab, setActiveTab] = useState<string>(SettingTabs.USER_INFO)

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageUserMount)
  })

  const tabs = [
    {
      title: SettingTabs.USER_INFO,
      displayTitle: i18n.t(i18nKeys.biz_user_info),
      icon: 'user',
      content: <BasicSetting />,
    },
    {
      title: SettingTabs.SETTINGS,
      displayTitle: i18n.t(i18nKeys.biz_user_setting),
      icon: 'Cog',
      content: <SettingsContainer />,
    },
    {
      title: 'access',
      displayTitle: '访问权限管理',
      icon: 'key',
      content: <AccessManager />,
    },
  ] as TabItem[]

  return (
    <HFPageLayout outerClassName="user-container">
      <HFLayout direction="vertical">
        <HFPanel className="dash-title-panel" disableLoading>
          <h1>{i18n.t(i18nKeys.biz_user_title)}</h1>
          <p>{i18n.t(i18nKeys.biz_user_title_desc)}</p>
        </HFPanel>
        <HFPanel disableLoading className="settings-panel">
          <VerticalTab
            showIcon
            showTitle
            active={activeTab}
            activeSetter={setActiveTab}
            items={tabs}
          />
        </HFPanel>
      </HFLayout>
    </HFPageLayout>
  )
}
