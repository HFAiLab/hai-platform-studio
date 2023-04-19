import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ClusterUnit } from '@hai-platform/shared'
import { useFocusInterval } from '@hai-platform/studio-pages/lib/hooks/useFocusInterval'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import { Tab } from '@hai-ui/core/lib/esm/components/tabs/tab'
import { Tabs } from '@hai-ui/core/lib/esm/components/tabs/tabs'
import React, { useContext, useEffect, useState } from 'react'
import { useGroot } from 'use-groot'
import { GlobalApiServerClient } from '../../api/apiServer'
import { User } from '../../modules/user'
import { GlobalContext } from '../../reducer/context'
import { CTMListV2Container } from './biz-comps/CTM2/index'
import { UserList2Container } from './biz-comps/UserList2/UserListContainer'
import { CONTAINER_PAGE_SIZE, ContainerOpEnum } from './schema'

import './tabs.scss'

export const getClusterDFMap = () => {
  return GlobalApiServerClient.request(ApiServerApiName.CLUSTER_DF, {
    monitor: false,
  }).then((res) => {
    const map = new Map<string, ClusterUnit>()
    for (const cluster of res.cluster_df) {
      map.set(cluster.name, cluster)
    }

    return map
  })
}
export const ContainerManager = (): JSX.Element => {
  const { state, dispatch } = useContext(GlobalContext)
  const isAdmin = User.getInstance().isHubAdmin()
  const currentOpPanel = state.jupyterManagePageState.op
  const setCurrentOpPanel = (op: ContainerOpEnum) => {
    dispatch([
      {
        type: 'jupyterManagePageState',
        value: { ...state.jupyterManagePageState, op, filterKw: '' },
      },
    ])
  }
  const [allTaskCustomParams, setAllTaskCustomParams] = useState<{ [key: string]: string }>({})
  const [currentPageForAll, setCurrentPageForAll] = useState(1)

  const { data: clusterDFMap, refresh: refreshClusterDF } = useGroot({
    fetcher: getClusterDFMap,
    auto: true,
    swr: true, // 开启 swr 以减少闪烁
  })

  // 5min 刷一次
  useFocusInterval(() => {
    refreshClusterDF()
  }, 5 * ONEMINUTE)

  const {
    status: AllDataStatus,
    data: allData,
    refresh: allDataRefresh,
    req: allDataReq,
  } = useGroot({
    fetcher: (params) =>
      GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_ALL_TASKS, params),
    params: [
      {
        page: currentPageForAll,
        page_size: CONTAINER_PAGE_SIZE,
        ...allTaskCustomParams,
      },
    ],
    auto: false,
    swr: true,
  })

  useEffect(() => {
    if (currentOpPanel === ContainerOpEnum.all) {
      allDataReq({
        page: currentPageForAll,
        page_size: CONTAINER_PAGE_SIZE,
        ...allTaskCustomParams,
      })
    } else {
      setAllTaskCustomParams({})
      setCurrentPageForAll(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOpPanel])

  return (
    <div>
      <Tabs
        className="container-tab"
        onChange={(id) => {
          setCurrentOpPanel(id as ContainerOpEnum)
        }}
        selectedTabId={currentOpPanel}
        renderActiveTabPanelOnly
        animate={false}
      >
        <Tab
          id={ContainerOpEnum.userList}
          title={i18n.t(i18nKeys.biz_container_list)}
          panel={<UserList2Container />}
        />
        <Tabs.Expander />
        {isAdmin && (
          <Tab
            id={ContainerOpEnum.all}
            title={i18n.t(i18nKeys.base_admin)}
            panelClassName="container-admin-container"
            panel={
              <CTMListV2Container
                clusterDFMap={clusterDFMap}
                data={allData}
                status={AllDataStatus}
                refresh={allDataRefresh}
              />
            }
          />
        )}
      </Tabs>
    </div>
  )
}
