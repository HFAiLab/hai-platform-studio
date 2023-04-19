import { i18n, i18nKeys } from '@hai-platform/i18n'
import React, { useState } from 'react'
import { dateStr } from '../../../utils/convert'
import { RefreshBtn } from '../../refresh'

export const WindowTitle = (props: {
  title: string
  desc?: string
  showUpdateTime?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  updateDate?: Date
}): JSX.Element => {
  const [update_date, setUpdate] = useState(new Date())

  return (
    <div className="hf-title">
      <h2>{props.title}</h2>
      {props.desc && (
        <div>
          {props.desc.split('\n').map((item) => (
            <p key={item}>
              {item}{' '}
              {!props.showUpdateTime
                ? ''
                : `${i18n.t(i18nKeys.biz_exp_status_updated)}: ${dateStr(
                    props.updateDate ?? update_date,
                    true,
                  )}`}
            </p>
          ))}
        </div>
      )}

      {props.showRefresh && (
        <div className="title-refresh">
          <RefreshBtn
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

export const TabTitle = (props: { title: string; desc?: string }): JSX.Element => {
  return (
    <div className="hf-tab-title">
      <h3>{props.title}</h3>
      {props.desc && (
        <div>
          {props.desc.split('\n').map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      )}
    </div>
  )
}
