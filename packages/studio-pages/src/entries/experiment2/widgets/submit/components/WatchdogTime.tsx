import { i18n, i18nKeys } from '@hai-platform/i18n'
import { FormGroup } from '@hai-ui/core/lib/esm'
import React from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface WatchdogTimeInputProps extends SubmitCommonInputProps {
  watchdogTime: number
  showEditTip: boolean
  editTip?: string | undefined
}

export const Exp2watchdogTimeInput = (props: WatchdogTimeInputProps) => {
  return (
    <FormGroup
      label={genPopover({
        inline: true,
        label: i18n.t(i18nKeys.biz_exp_submit_watchdog_time),
        helperText: i18n.t(i18nKeys.biz_exp_submit_watchdog_time_desc),
      })}
      labelFor="exp2-watchdog-time"
      className="watchdog-form-group"
    >
      <div style={{ fontSize: 12, marginBottom: 10, color: 'var(--hf-text-lighter)' }}>
        {i18n.t(i18nKeys.biz_exp_submit_watchdog_time_default)}
      </div>
      <div className="extra-options-inner-unit">
        {props.showEditTip && <Exp2EditTip value={`${props.editTip}`} isLock={props.isLock} />}
        <input
          type="number"
          className="hf-input middle exp-submit-number-input"
          disabled={props.isLock}
          onChange={(e) => {
            const wt = Number(e.target.value)
            if (Number.isNaN(wt)) return
            props.onChange({ type: 'watchdog_time', value: wt })
          }}
          min={0}
          value={props.isLoading ? '' : props.watchdogTime}
        />
      </div>
    </FormGroup>
  )
}
