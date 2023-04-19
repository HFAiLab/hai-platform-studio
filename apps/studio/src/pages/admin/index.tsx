import { Icon } from '@hai-ui/core/lib/esm/components'
import React, { useContext, useMemo } from 'react'
import { useEffectOnce } from 'react-use'
import { HFLayout, HFPageLayout } from '../../components/HFLayout'
import './index.scss'
import { HFPanel } from '../../components/HFPanel'
import { VerticalTab } from '../../components/VerticalTab'
import { User } from '../../modules/user'
import { GlobalContext } from '../../reducer/context'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { getAdminTabs } from './tabsMap'

export const AdminPage = () => {
  const { canAdmin } = User.getInstance()
  const tabs = useMemo(getAdminTabs, [])

  const { state, dispatch } = useContext(GlobalContext)
  const tabParam = state.adminState.tab

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageAdminMount)
  })

  if (!canAdmin) {
    return null
  }

  return (
    <HFPageLayout outerClassName="admin-container">
      <HFLayout direction="vertical">
        <HFPanel className="dash-title-panel" disableLoading>
          <h1>管理</h1>
          <p>调整个人或团队的配置</p>
        </HFPanel>
        <HFPanel disableLoading className="settings-panel">
          {Boolean(tabs.length) && (
            <VerticalTab
              showIcon
              showTitle
              active={(tabParam || tabs[0]?.title) ?? ''}
              activeSetter={(tab) => {
                dispatch([
                  {
                    type: 'adminState',
                    value: {
                      tab,
                    },
                  },
                ])
              }}
              items={tabs}
            />
          )}
          {!tabs.length && (
            <div className="no-permission">
              <Icon icon="issue" size={40} />
              <div className="desc"> 没有可以管理的内容</div>
            </div>
          )}
        </HFPanel>
      </HFLayout>
    </HFPageLayout>
  )
}
