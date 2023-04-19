import { i18n, i18nKeys } from '@hai-platform/i18n'
import { useVisibleInterval } from '@hai-platform/studio-pages/lib/hooks/useVisibleInterval'
import React, { useReducer, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { GlobalOverview as NGlobalOverview } from '../../biz-components/Panels/ClusterOverview'
import { GlobalOverviewExt } from '../../biz-components/Panels/ClusterOverviewExt'
import { DashboardTitle } from '../../biz-components/Panels/DashboardTitle'
import { ErrorTrainings } from '../../biz-components/Panels/ErrorTrainings'
import { GlobalRefresh } from '../../biz-components/Panels/GlobalRefresh'
import { UsageRank } from '../../biz-components/Panels/UsageRank'
import { UserInfoBlock } from '../../biz-components/Panels/UserInfoBlock'
import { UserMessage } from '../../biz-components/Panels/UserMessage'
import { HFLayout, HFPageLayout } from '../../components/HFLayout'
import { HFPanel } from '../../components/HFPanel'
import { WebEventsKeys, hfEventEmitter } from '../../modules/event'
import { HomePanelStrategyName } from '../../modules/settings/config'
import { hasCustomMarsServer } from '../../utils'
import { AilabCountly, CountlyEventKey } from '../../utils/countly'
import { HomeDND } from './biz-comps/DND'
import { GlobalDndConfigManager } from './biz-comps/DND/dndConfig'
import { DashBoardConfig } from './config'
import type { HomeActionParams, HomeState } from './reducer'
import { HomeDispatchWrapper, homeReducer, homeReducerInit } from './reducer'
import { GlobalReportInstance } from './report'

export const HomeContext = React.createContext<{
  state: HomeState
  dispatch: (params: HomeActionParams) => void
  // @ts-expect-error because ignore unused error
}>({})

export const Home = () => {
  const [dndStrategyName, setDndStrategyName] = useState(
    GlobalDndConfigManager.getCurrentStrategyName(),
  )
  const [state, rawDispatch] = useReducer(homeReducer, homeReducerInit())

  const dispatch = HomeDispatchWrapper(rawDispatch)

  useEffectOnce(() => {
    AilabCountly.safeReport(CountlyEventKey.pageHomeMount)

    return () => {
      GlobalReportInstance.clear()
    }
  })

  useVisibleInterval(() => {
    hfEventEmitter.emit(WebEventsKeys.slientRefreshDashboard, null)
  }, DashBoardConfig.refreshInterval)

  const updatePanelsByStrategy = (strategyName: HomePanelStrategyName) => {
    GlobalDndConfigManager.updatePanelsToRemote({
      strategyName,
    }).then((newConfig) => {
      hfEventEmitter.emit(WebEventsKeys.homeDNDStrategyChange, newConfig)
      setDndStrategyName(strategyName)
      AilabCountly.safeReport(CountlyEventKey.dndUpdateByStrategy)
    })
  }

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <HomeContext.Provider value={{ state, dispatch }}>
      <HFPageLayout outerClassName="home-container">
        <HFLayout>
          <HFLayout direction="vertical" style={{ minWidth: '1008px' }}>
            <div className="dash-title-panel">
              <DashboardTitle
                strategyList={GlobalDndConfigManager.getStrategies()}
                onChange={(name) => {
                  updatePanelsByStrategy(name)
                }}
                currentStrategyName={dndStrategyName}
              />
            </div>
            <HFPanel className="dash-error-panel" defaultVisibility="hide">
              <ErrorTrainings />
            </HFPanel>
            <HomeDND
              onStrategyChangeToCustom={() => {
                setDndStrategyName(HomePanelStrategyName.Custom)
              }}
            />
          </HFLayout>
          <HFLayout direction="vertical" style={{ width: 362, flexShrink: 0, paddingTop: 46 }}>
            <GlobalRefresh />
            {!window._hf_user_if_in && (
              <HFPanel title={i18n.t(i18nKeys.biz_home_about_me)} shadow disableLoading>
                <UserInfoBlock />
              </HFPanel>
            )}
            {!hasCustomMarsServer() && window._hf_user_if_in && (
              <HFPanel title={i18n.t(i18nKeys.biz_home_cluster_overview)} shadow>
                <NGlobalOverview />
              </HFPanel>
            )}
            {!hasCustomMarsServer() && !window._hf_user_if_in && (
              <HFPanel title={i18n.t(i18nKeys.biz_home_cluster_spare_overview)} shadow>
                <GlobalOverviewExt />
              </HFPanel>
            )}
            <HFPanel title={i18n.t(i18nKeys.biz_home_messages)} shadow>
              <UserMessage />
            </HFPanel>
            {}
            {window._hf_user_if_in && !window.is_hai_studio && (
              <HFPanel title={i18n.t(i18nKeys.biz_home_rankings)} shadow>
                <UsageRank />
              </HFPanel>
            )}
          </HFLayout>
        </HFLayout>
      </HFPageLayout>
    </HomeContext.Provider>
  )
}
