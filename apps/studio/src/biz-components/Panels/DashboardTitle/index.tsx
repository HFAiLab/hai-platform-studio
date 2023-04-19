import { i18n, i18nKeys } from '@hai-platform/i18n'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Button, MenuItem } from '@hai-ui/core'
import { Select } from '@hai-ui/select'
import React from 'react'
import DocSvg from '../../../components/svg/doc.svg?raw'
import PanelWorkspaceSvg from '../../../components/svg/panel-strategy.svg?raw'
import { getCurrentDocURL } from '../../../consts'
import type { HomePanelStrategyName } from '../../../modules/settings/config'
import type { StrategyInfo } from '../../../pages/home/biz-comps/DND/dndConfig'

import './index.scss'

const StrategySelect = Select.ofType<StrategyInfo>()

export interface DashboardTitleProps {
  strategyList: StrategyInfo[]
  currentStrategyName: HomePanelStrategyName | undefined
  onChange: (strategyName: HomePanelStrategyName) => void
}

// Studio 概览页面左侧顶部标题部分
export const DashboardTitle = (props: DashboardTitleProps) => {
  const getCurrentText = () => {
    const key = props.strategyList.find((s) => s.name === props.currentStrategyName)?.display
    if (key) {
      return i18n.t(key)
    }
    return 'Unknown'
  }

  return (
    <div className="dash-title-container-v2">
      <h1>{i18n.t(i18nKeys.biz_dashboard_title)}</h1>
      <div style={{ marginTop: 20, display: 'flex' }}>
        <Button
          onClick={() => {
            window.open(getCurrentDocURL())
          }}
          icon={<SVGWrapper svg={DocSvg} dClassName="title-svg" width={16} height={16} />}
          outlined
        >
          {i18n.t(i18nKeys.biz_dev_rule)}
        </Button>
        <div className="flex-1" />
        {!window.is_hai_studio && (
          <StrategySelect
            fill
            className="strategy-select-container"
            filterable={false}
            items={props.strategyList}
            // eslint-disable-next-line react/no-unstable-nested-components
            itemRenderer={(renderedStrategy: StrategyInfo, { handleClick }) => {
              return (
                <MenuItem
                  active={renderedStrategy.name === props.currentStrategyName}
                  key={`${renderedStrategy.name}`}
                  onClick={handleClick}
                  text={i18n.t(renderedStrategy.display)}
                />
              )
            }}
            popoverProps={{ minimal: true, position: 'bottom-right' }}
            onItemSelect={(item: StrategyInfo) => {
              props.onChange(item.name)
            }}
          >
            <Button
              icon={<SVGWrapper width="16px" height="16px" svg={PanelWorkspaceSvg} />}
            >{`${i18n.t(i18nKeys.biz_home_dnd_switch_layout)} (${i18n.t(
              i18nKeys.biz_base_current,
            )}: ${getCurrentText()})`}</Button>
          </StrategySelect>
        )}
      </div>
    </div>
  )
}
