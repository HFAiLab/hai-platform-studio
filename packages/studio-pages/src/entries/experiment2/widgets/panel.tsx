import React from 'react'
import { Exp2Head } from './head'
import { Exp2Nodes } from './nodes'
import { ExpScheduleStatus } from './schedule-status'
import { ExpStatusLite } from './status'
import { Exp2Submit } from './submit'

export interface Exp2PanelProps {
  refresh: () => void
  syncRemoteInfo: () => Promise<void>
}

export const Exp2Panel = (props: Exp2PanelProps) => {
  return (
    <div className="exp-tab-container hf" id="exp2-tab-container">
      <Exp2Head refresh={props.refresh} />
      <Exp2Submit refresh={props.refresh} syncRemoteInfo={props.syncRemoteInfo} />
      <ExpScheduleStatus />
      <ExpStatusLite />
      <Exp2Nodes mini />
    </div>
  )
}
