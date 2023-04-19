import { bytesToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import { Colors } from '@hai-ui/colors/lib/colors'
import { Icon } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import React from 'react'
import './index.scss'

export enum DefaultMetricStyle {
  H1 = 'H1',
  H2 = 'H2',
  H25 = 'H25',
  H3 = 'H3',
}

// 它应该支持一些数据自动格式化能力，不过目前还没怎么用上
export enum ProcessType {
  plain = 'plain',
  percentage = 'percentage',
  // ms = 'ms',
  // hours = 'hours',
  bytes = 'bytes',
}

interface MetricItemProps {
  title: string | ReactNode
  value: string | number | ReactNode
  unit?: string
  className?: string
  help?: string
  iconSize?: number
  titleColor?: keyof typeof Colors
  valueColor?: keyof typeof Colors
  valueMarginTop?: number
  style?: DefaultMetricStyle
  processType?: ProcessType
  fixed?: number
  flex?: number
  onClick?: () => unknown
}

export const NO_DATA_TAG = '--'
export const RECOMMEND_FIXED = 1
export const REFINED_FIXED = 2

export const MetricItem = (p: MetricItemProps) => {
  const iconSize = p.iconSize ?? 14
  const titleStyle = p.titleColor ? { color: Colors[p.titleColor] } : undefined
  const processType = p.processType ?? ProcessType.plain

  const convertValue = (value: string | number | ReactNode) => {
    if ('fixed' in p) {
      return Number(value).toFixed(p.fixed)
    }
    return value
  }

  const processValue = (value: string | number | ReactNode) => {
    if (value === NO_DATA_TAG) return NO_DATA_TAG
    switch (processType) {
      case ProcessType.bytes:
        return bytesToDisplay(Number(value))
      case ProcessType.percentage:
        return `${convertValue(Number(value) * 100)}%`
      case ProcessType.plain:
      default:
        return convertValue(value)
    }
  }

  const valueStyle =
    p.valueColor || p.valueMarginTop
      ? { color: p.valueColor ? Colors[p.valueColor] : undefined, marginTop: p.valueMarginTop }
      : undefined

  return (
    <div
      style={p.flex ? { flex: p.flex } : undefined}
      className={classNames('aiui-metric-item', p.className, p.style, { pointer: !!p.onClick })}
      onClick={() => {
        if (p.onClick) p.onClick()
      }}
    >
      <div className="title" style={titleStyle}>
        {p.title}
        {p.help ? (
          <Tooltip2 content={p.help}>
            <Icon style={{ marginLeft: 10, verticalAlign: 'top' }} size={iconSize} icon="help" />
          </Tooltip2>
        ) : null}
      </div>
      <div className="value" style={valueStyle}>
        {processValue(p.value)}
        {p.unit ? ` ${p.unit}` : null}
      </div>
    </div>
  )
}
