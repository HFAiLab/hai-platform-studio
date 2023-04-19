/* eslint-disable react/no-unused-prop-types */
import { i18n, i18nKeys } from '@hai-platform/i18n'
import './index.scss'
import { Button } from '@hai-ui/core/lib/esm'
import { Colors } from '@hai-ui/core/lib/esm/common'
import classNames from 'classnames'
import { chunk } from 'lodash-es'
import React, { useState } from 'react'
import { getUserName } from '../../utils'
import { isDarkTheme } from '../../utils/theme'

export type COLOR = keyof typeof Colors

export interface UsageItem {
  name: string
  amount: number
  color?: COLOR
}

interface UsageBarProps {
  total: number | null
  className?: string
  data: UsageItem[] | null
  showPercentage?: boolean
  showTooltip?: boolean
  showTooltipTotal?: boolean
  showTooltipFree?: boolean
  tooltip?: string | JSX.Element
  width?: number | string
  height?: number | string
  valueToText?(amount: number, name?: string): string
  backgroundColor?: COLOR
  freeText?: string
  totalText?: string
}

export const UsageBar = (props: UsageBarProps) => {
  const noData = props.data === null || !props.total || props.data.length === 0
  const [popoverPin, setPopoverPin] = useState(false)

  if (noData) {
    return (
      <div
        className={classNames('aiui-usage-bar', props.className)}
        style={{
          width: props.width ?? '100%',
        }}
      >
        <div
          className="no-data"
          style={{
            backgroundColor:
              Colors[props.backgroundColor ?? (isDarkTheme() ? 'DARK_GRAY5' : 'LIGHT_GRAY3')],
            height: props.height ?? 14,
            lineHeight: `${props.height ?? 14}px`,
            textAlign: 'center',
          }}
        >
          {i18n.t(i18nKeys.biz_no_data)}
        </div>
      </div>
    )
  }

  const valueToText = props.valueToText || ((v) => String(v))
  const { showPercentage } = props
  const total = props.total!

  let free = total
  props.data?.forEach((i) => {
    free -= i.amount
  })

  let tooltipContent: string | JSX.Element = ''

  // eslint-disable-next-line react/no-unstable-nested-components
  const UsageBarTip = () => {
    const currentUserName = getUserName()
    return (
      <div>
        {props.showTooltipFree && (
          <p key="free_el" className="usage-bar-tip-unit">
            <b>
              {props.freeText ?? 'Free'} : {valueToText(free, 'Free')}&nbsp;&nbsp;
              {showPercentage ? `${((100 * free) / total).toFixed(2)}%` : null}
            </b>
          </p>
        )}
        {props.showTooltipTotal && (
          <p key="total_el" className="usage-bar-tip-unit">
            <b>
              {props.totalText ?? 'Total'} : {valueToText(total, 'Total')}&nbsp;&nbsp;
            </b>
          </p>
        )}
        <div className="usage-bar-tip-chunk-list">
          {chunk(props.data!, 10).map((arrList) => {
            return (
              <div className="usage-bar-tip-chunk-item">
                {arrList.map((i: any) => (
                  <p
                    key={i.name}
                    className={classNames('usage-bar-tip-unit', {
                      'current-user-tip': i.name === currentUserName,
                    })}
                  >
                    {i.name} : {valueToText(i.amount, i.name)}&nbsp;&nbsp;
                    {showPercentage ? `${((100 * i.amount) / total).toFixed(2)}%` : null}
                  </p>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (props.showTooltip) {
    if (props.tooltip) {
      tooltipContent = props.tooltip
    } else {
      tooltipContent = <UsageBarTip />
    }
  }

  const defaultColorTable = ['BLUE5', 'BLUE3'] as UsageItem['color'][]
  const defaultColorTableLen = defaultColorTable.length

  const itemContent = props.data!.map((item, idx) =>
    item.amount > 0 ? (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={`${idx}${item.amount}`}
        className="bar-item"
        style={{
          width: `${((100 * item.amount) / total).toFixed(2)}%`,
          backgroundColor: Colors[item.color ?? defaultColorTable[idx % defaultColorTableLen]!],
        }}
      />
    ) : null,
  )

  return (
    <div
      className={classNames('aiui-usage-bar', props.className)}
      style={{
        width: props.width ?? '100%',
      }}
    >
      <div className="bar-container">
        <div
          className="bar-entity"
          style={{
            backgroundColor:
              Colors[props.backgroundColor ?? (isDarkTheme() ? 'DARK_GRAY5' : 'LIGHT_GRAY3')],
            height: props.height ?? 14,
          }}
        >
          {itemContent}
        </div>

        <div
          className={classNames('quick-bottom-tooltip', {
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

          {tooltipContent}
        </div>
      </div>
    </div>
  )
}
