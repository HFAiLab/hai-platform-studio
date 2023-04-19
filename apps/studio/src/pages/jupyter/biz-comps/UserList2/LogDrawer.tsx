import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ContainerTask } from '@hai-platform/shared'
import type { Chain } from '@hai-platform/studio-pages/lib'
import { Drawer, DrawerSize, Position } from '@hai-ui/core/lib/esm'
import React from 'react'
import { LogViewer } from '../../../../biz-components/LogViewer/index'

export interface ContainerMockChain extends ContainerTask {
  token: string

  currentService?: string

  pods: any
}

export interface LogDrawerProps {
  containerInfoForLog: ContainerMockChain | null
  onClose: () => void
}

export const LogDrawer = (props: LogDrawerProps) => {
  return (
    <Drawer
      isOpen={!!props.containerInfoForLog}
      className="container-log-container"
      onClose={() => {
        if (props.onClose) props.onClose()
      }}
      position={Position.LEFT}
      hasBackdrop={false}
      size={DrawerSize.LARGE}
      style={{ minWidth: '750px' }}
      title={
        <p>
          <strong>{`Log-${props.containerInfoForLog?.nb_name}${
            props.containerInfoForLog?.currentService
              ? ` [${props.containerInfoForLog.currentService}]`
              : ''
          }`}</strong>
          {!props.containerInfoForLog?.currentService && (
            <span className="container-log-container-sub-title">
              {i18n.t(i18nKeys.base_view_container_log_tip)}
            </span>
          )}
        </p>
      }
    >
      {props.containerInfoForLog && (
        <LogViewer
          chain={props.containerInfoForLog as unknown as Chain}
          rank={0}
          visible
          service={props.containerInfoForLog.currentService}
          token={props.containerInfoForLog.token}
        />
      )}
    </Drawer>
  )
}
