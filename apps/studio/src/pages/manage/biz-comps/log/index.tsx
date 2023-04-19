import type { Chain } from '@hai-platform/studio-pages/lib'
import React, { useEffect, useState } from 'react'
import { LogViewer } from '../../../../biz-components/LogViewer'
import { WebEventsKeys, hfEventEmitter } from '../../../../modules/event'
import { LevelLogger, getCurrentAgencyToken, getToken } from '../../../../utils'
import { getLogDockIdByChainId } from '../../utils'

export interface LogPageProps {
  chain: Chain
  rank: number
}

export const LogPage = (props: LogPageProps): JSX.Element => {
  const [visible, setVisible] = useState(true)

  const onLogVisibleUpdated = (activeIds: string[]): void => {
    const dockId = getLogDockIdByChainId(props.chain.chain_id)
    const nextVisible = activeIds.includes(dockId)
    if (nextVisible !== visible) {
      LevelLogger.info(`onLogVisibleUpdated, chain_id: ${props.chain.chain_id}: ${nextVisible}`)
      // logApp.emit(EventsKeys.VisibilityChanged, nextVisible)
      setVisible(nextVisible)
    }
  }

  useEffect(() => {
    hfEventEmitter.on(WebEventsKeys.logVisibleUpdated, onLogVisibleUpdated)
    // hint: 注意这里回调引用了 visible，注意变化！
    return () => {
      hfEventEmitter.off(WebEventsKeys.logVisibleUpdated, onLogVisibleUpdated)
    }
  })

  return (
    <LogViewer
      chain={props.chain}
      rank={props.rank}
      visible={visible}
      enableLogShare
      token={getCurrentAgencyToken() || getToken()}
    />
  )
}
