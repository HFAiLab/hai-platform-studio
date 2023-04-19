import { i18n } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import React from 'react'
import type { HomePanelNames } from '../../../../modules/settings/config'
import { PanelMetaInfoMap } from '../DND/dndConfig'

import './index.scss'

export interface CollapseCardProps {
  panelName: HomePanelNames
  onClick?: (panelName: HomePanelNames) => void
}

// 概览底下的 dock 部分
export const CollapseCard = React.memo((props: CollapseCardProps) => {
  const currentConfig = PanelMetaInfoMap[props.panelName]
  return (
    <div
      className="collapse-card"
      onClick={() => {
        if (props.onClick) props.onClick(props.panelName)
      }}
    >
      <SVGWrapper width="60px" height="60px" svg={currentConfig.icon} />
      <p className="collapse-text">{i18n.t(currentConfig.text)}</p>
    </div>
  )
})
