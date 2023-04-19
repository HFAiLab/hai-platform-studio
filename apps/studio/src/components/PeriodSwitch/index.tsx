import { i18n, i18nKeys } from '@hai-platform/i18n'
import { DatePeriod } from '@hai-platform/shared'
import { Button, ButtonGroup } from '@hai-ui/core/lib/esm/components'
import React, { useState } from 'react'
import './index.scss'
import { convertDateStrToDisplay } from '../../utils/convert'

interface PeriodSwitchPropsBase {
  setter?(v: DatePeriod): void
  text?: string
  hideButtons?: boolean
  disabled?: boolean
  outlined?: boolean
  minimal?: boolean
  small?: boolean
  availablePeriods?: DatePeriod[] | { period: DatePeriod; disabled?: boolean }[]
  dateStr?: string
}

interface PPA {
  defaultPeriod?: never
  currentPeriod?: DatePeriod
}
interface PPB {
  defaultPeriod?: DatePeriod
  currentPeriod?: never
}

type PeriodSwitchProps = PeriodSwitchPropsBase & (PPA | PPB)

export const PeriodSwitch = (props: PeriodSwitchProps) => {
  let availablePeriods = [
    { period: DatePeriod.realtime, disabled: false },
    { period: DatePeriod.daily, disabled: false },
    { period: DatePeriod.weekly, disabled: false },
    { period: DatePeriod.monthly, disabled: false },
  ] as { period: DatePeriod; disabled?: boolean }[]

  if (props.availablePeriods) {
    availablePeriods = []
    for (const item of props.availablePeriods) {
      if (typeof item === 'string') {
        availablePeriods.push({ period: item, disabled: false })
      } else {
        availablePeriods.push(item)
      }
    }
  }

  const defaultPeriod = props.defaultPeriod ?? availablePeriods[0]!.period
  const [period, setPeriod] = useState(defaultPeriod)
  const currentP = props.currentPeriod ?? period
  const setter = props.setter ?? (() => {})
  const dateStrShow = convertDateStrToDisplay(props.dateStr, period)

  return (
    <div className="aiui-period-switch">
      {(props.text || dateStrShow) && <span className="date">{props.text || dateStrShow}</span>}
      {!props.hideButtons && (
        <ButtonGroup>
          {availablePeriods.map((p) => {
            // 兜底
            const trans = (i18nKeys as any)[`base_${p.period}`]
            return (
              <Button
                key={p.period}
                small={props.small}
                outlined={props.outlined}
                disabled={props.disabled || p.disabled}
                minimal={props.minimal}
                active={currentP === p.period}
                onClick={() => {
                  setPeriod(p.period)
                  setter(p.period)
                }}
              >
                {trans ? i18n.t(trans) : p.period}
              </Button>
            )
          })}
        </ButtonGroup>
      )}
    </div>
  )
}
