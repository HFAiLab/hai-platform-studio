import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { SyncStatusList } from '@hai-platform/shared'
import { SyncFileType } from '@hai-platform/shared'
import { Position } from '@hai-ui/core/lib/esm/common/position'
import { Drawer, DrawerSize } from '@hai-ui/core/lib/esm/components/drawer/drawer'
import type { ArtColumn } from 'ali-react-table/dist/interfaces'
import dayjs from 'dayjs'
import React, { useContext, useState } from 'react'
import './index.scss'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { GlobalApiServerClient } from '../../../api/apiServer'
import { NoData } from '../../../components/Errors/NoData'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { HFDashTable } from '../../../components/HFTable/index'
// eslint-disable-next-line import/order
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { SyncStatusObjectMap } from './types'
import { WorkspaceBrowser } from './WorkspaceBrowser'

function composeSyncStatus(statusList: SyncStatusList) {
  const result: SyncStatusObjectMap = {}
  for (const syncStatus of statusList) {
    result[syncStatus.name] = syncStatus
  }
  return result
}

export const Workspace = React.memo(() => {
  const panelCTX = useContext(HFPanelContext)

  const [showCheckpoints, setShowCheckpoints] = useState(false)
  const [workspaceMap, setWorkspaceMap] = useState<SyncStatusObjectMap>({})
  const fetchSyncStatus = () => {
    return GlobalApiServerClient.request(ApiServerApiName.GET_SYNC_STATUS, {
      file_type: SyncFileType.workspace,
      name: '*',
    }).then((res) => {
      setWorkspaceMap(composeSyncStatus(res.data))
    })
  }
  const [activePanelName, setActivePanelName] = useState('')

  const fetchData = () => {
    if (panelCTX.loadingStatus === LoadingStatus.loading) return
    panelCTX.setLoadingStatus(LoadingStatus.loading)

    fetchSyncStatus()
      .then(() => {
        panelCTX.setLoadingSuccess()
      })
      .catch(() => {
        panelCTX.setLoadingError()
      })
  }

  useEffectOnce(() => {
    fetchData()
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag])

  const columns = [
    { code: 'name', name: i18n.t(i18nKeys.biz_workspace_name), width: 10, align: 'left' },
    {
      code: 'local_path',
      name: i18n.t(i18nKeys.biz_workspace_local_path),
      width: 20,
      align: 'left',
    },
    {
      code: 'cluster_path',
      name: i18n.t(i18nKeys.biz_workspace_cluster_path),
      width: 20,
      align: 'left',
    },
    {
      code: 'push_status',
      name: i18n.t(i18nKeys.biz_workspace_push_status),
      width: 10,
      align: 'left',
      render: (p) => {
        if (!p) return '-'
        return p
      },
    },
    {
      code: 'last_push',
      name: i18n.t(i18nKeys.biz_workspace_push_updated_at),
      width: 12,
      align: 'left',
      render: (p) => {
        if (!p) return '-'
        return dayjs(new Date(p)).format('YY-MM-DD HH:mm')
      },
    },
    {
      code: 'pull_status',
      name: i18n.t(i18nKeys.biz_workspace_pull_status),
      width: 10,
      align: 'left',
      render: (p) => {
        if (!p) return '-'
        return p
      },
    },
    {
      code: 'last_pull',
      name: i18n.t(i18nKeys.biz_workspace_pull_updated_at),
      width: 12,
      align: 'left',
      render: (p) => {
        if (!p) return '-'
        return dayjs(new Date(p)).format('YY-MM-DD HH:mm')
      },
    },
    {
      code: '',
      name: '',
      width: 6,
      align: 'left',
      render: (p, row) => {
        return (
          <p
            className="workspace-browser-btn"
            onClick={() => {
              setShowCheckpoints(!showCheckpoints)
              setActivePanelName(row.name)
            }}
          >
            {i18n.t(i18nKeys.biz_workspace_browser)}
          </p>
        )
      },
    },
  ] as Array<ArtColumn>

  return (
    <div>
      <Drawer
        isOpen={showCheckpoints}
        className="jupyter-drawer-container"
        onClose={() => {
          setShowCheckpoints(false)
        }}
        position={Position.LEFT}
        // backdropClassName={"app-drawer-backdrop"}
        hasBackdrop={false}
        size={DrawerSize.STANDARD}
        style={{ minWidth: '750px' }}
        title="WorkSpace"
      >
        <div className="app-drawer-content-container">
          <WorkspaceBrowser
            workspaceMap={workspaceMap}
            activePanelName={activePanelName}
            updateActivePanelName={(name: string) => {
              setActivePanelName(name)
            }}
          />
        </div>
      </Drawer>
      <HFDashTable
        className="workspace-table"
        columns={columns}
        emptyCellHeight={100}
        isLoading={panelCTX.loadingStatus === LoadingStatus.loading}
        components={{
          // eslint-disable-next-line react/no-unstable-nested-components
          EmptyContent: () => <NoData />,
        }}
        dataSource={Object.values(workspaceMap)}
      />
    </div>
  )
})

Workspace.displayName = 'Workspace'
