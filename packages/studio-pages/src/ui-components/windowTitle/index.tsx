import { i18n, i18nKeys } from '@hai-platform/i18n'
import React, { useState } from 'react'
import { dateStr } from '../../utils/convert'
import { DynamicUpdate } from '../dynamicUpdate'
import { RefreshBtn } from '../refresh'
import { icons } from '../svgIcon'
import { SVGWrapper } from '../svgWrapper'

export const WindowTitle = (props: {
  title: string
  desc?: string
  // eslint-disable-next-line react/no-unused-prop-types
  showUpdateTime?: boolean
  showRefresh?: boolean
  smallRefresh?: boolean
  onRefresh?: () => void
  updateDate?: Date | undefined
  showAutoRefresh?: boolean
}): JSX.Element => {
  const [update_date, setUpdate] = useState(new Date())
  const fillColor = getComputedStyle(document.body).getPropertyValue('--hf-theme-color')

  const desc = `${props.desc ?? ''}`

  return (
    <div className="hf-title">
      <h2>{props.title}</h2>

      <div>
        <p>
          {desc}
          <DynamicUpdate
            style={{
              marginLeft: '5px',
              fontSize: '14px',
              display: 'inline-block',
            }}
            value={dateStr(props.updateDate ?? update_date, true)}
          />
        </p>
      </div>

      {props.showAutoRefresh && (
        <div className="title-refresh auto-refresh-ani">
          <p className="auto-refresh-p">
            <SVGWrapper width={20} height={20} fill={fillColor} svg={icons.auto_refresh} />
            &nbsp; {i18n.t(i18nKeys.biz_auto_refreshing)}
          </p>
        </div>
      )}

      {props.showRefresh && (
        <div className="title-refresh">
          <RefreshBtn
            small={props.smallRefresh}
            onClick={() => {
              if (props.onRefresh) {
                props.onRefresh()
                setUpdate(new Date())
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export const TrainingsTitle = (props: { updateDate: Date | undefined; refreshHandler(): void }) => {
  return (
    <WindowTitle
      showRefresh
      showUpdateTime
      updateDate={props.updateDate}
      title={i18n.t(i18nKeys.biz_exp_training_history_title_h)}
      onRefresh={props.refreshHandler}
    />
  )
}
