import type { ContainerTaskStatus } from '@hai-platform/shared'
import { JupyterTaskStatusColorMap } from '@hai-platform/shared'
import React from 'react'

import './index.scss'

export interface ContainerStatusProps {
  status: ContainerTaskStatus
}

export const ContainerStatus = (props: ContainerStatusProps) => {
  // const shouldHighlight = [ContainerTaskStatus.RUNNING, ContainerTaskStatus.QUEUED].includes(
  //   props.status,
  // )

  const shouldHighlight = false

  return shouldHighlight ? (
    <div
      className="container-status-info-active"
      style={{
        backgroundColor: JupyterTaskStatusColorMap[props.status],
      }}
    >
      {props.status}
    </div>
  ) : (
    <div
      className="container-status-info"
      style={{
        color: JupyterTaskStatusColorMap[props.status],
      }}
    >
      {props.status}
    </div>
  )
}
