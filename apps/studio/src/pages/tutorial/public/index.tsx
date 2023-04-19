import React from 'react'
import { HFLayout, HFPageLayout } from '../../../components/HFLayout'
import { HFPanel } from '../../../components/HFPanel'

export const Tutorial = () => {
  return (
    <HFPageLayout innerClassName="tutorial-container">
      <HFLayout className="tutorial-layout" direction="vertical">
        <HFPanel className="dash-title-panel tutorial-title-panel" disableLoading>
          <p>此部分暂未开源</p>
        </HFPanel>
      </HFLayout>
    </HFPageLayout>
  )
}
