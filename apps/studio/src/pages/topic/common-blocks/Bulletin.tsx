import React from 'react'
import { HFPanel } from '../../../components/HFPanel'

import './Bulletin.scss'

export const XTopicBulletin = () => {
  return (
    <HFPanel className="xtopic-bulletin" shadow title="公告" disableLoading>
      <div className="content">更多问答功能正在建设中，尽请期待</div>
    </HFPanel>
  )
}
