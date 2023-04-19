import { Button } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import React, { useState } from 'react'

import './index.scss'

export interface PercentageBarProps {
  metaList: PercentageValueMeta[]
  content?: React.ReactNode
  tip?: React.ReactNode
  measure?: string
  total?: number
}

export interface PercentageValueMeta {
  value: number
  tip: React.ReactNode
  intent: 'primary' | 'warn' | 'danger' | 'none' | 'success'
}

export const PercentageBar = (props: PercentageBarProps) => {
  const total = props.total || props.metaList.reduce((a, b) => a + b.value, 0)
  const [popoverPin, setPopoverPin] = useState(false)

  const used = props.metaList
    .filter((item) => {
      return item.tip !== 'free'
    })
    .reduce((a, b) => a + b.value, 0)

  const usagePercentage = total === 0 ? 0 : used / total

  return (
    <div className="percentage-bar-container">
      {props.content && props.content}
      <div className="percentage-bar">
        {props.metaList.map((meta) => (
          <div
            className={`segment ${meta.intent}`}
            style={{
              width: `${(meta.value / total) * 100}%`,
            }}
          />
        ))}
        <div
          className={classNames('percentage-bar-tip quick-bottom-tooltip', {
            permanent: popoverPin,
          })}
        >
          <div className="pin-container">
            <Button
              className={classNames('pin-btn', {
                pin: popoverPin,
              })}
              icon="pin"
              minimal
              small
              active={popoverPin}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setPopoverPin(!popoverPin)
              }}
            />
            <div className="flex-1" />
            <div className="other">详情</div>
          </div>
          <div className="tip-li">
            <div className="tip-li-key">total: </div>
            <div className="tip-li-value">
              {total}
              {props.measure ? ` ${props.measure}` : ''}
            </div>
          </div>
          {props.metaList.map((meta) => (
            <div className="tip-li">
              <div className="tip-li-key">{meta.tip}: </div>
              <div className="tip-li-value">
                {meta.value}
                {props.measure ? ` ${props.measure}` : ''}
              </div>
            </div>
          ))}
          <div className="tip-li">
            <div className="tip-li-key">使用率: </div>
            <div className="tip-li-value">{(usagePercentage * 100).toFixed(1)}%</div>
          </div>
          {props.tip && (
            <div className="tip-li custom-tip">
              <div className="tip-li-key">{props.tip}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
