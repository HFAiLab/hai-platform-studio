import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, FormGroup } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2WholeLifeStateInputProps extends SubmitCommonInputProps {
  value: number
}

export const Exp2WholeLifeStateInput = (props: Exp2WholeLifeStateInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifWholeLifeStateChangeInDraft = IfParamChangeInDraft(state, 'whole_life_state')

  return (
    <div className="exp2-form-group-container">
      {ifWholeLifeStateChangeInDraft && (
        <Exp2EditTip value={`${state.createDraft.whole_life_state}`} isLock={props.isLock} />
      )}
      <FormGroup
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_status_whole_life_state),
          helperText: i18n.t(i18nKeys.biz_exp_submit_whole_life_state_helper),
        })}
        labelFor="exp2-whole-life-state-input"
        inline
        className="whole-life-state-override"
      >
        <input
          name="whole_life_state"
          type="number"
          className="hf-input middle whole-life-state exp-submit-number-input"
          disabled={props.isLock}
          onChange={(e) => {
            const wholeLifeState = Number(e.target.value)
            if (Number.isNaN(wholeLifeState)) return
            props.onChange({
              type: 'whole_life_state',
              value: wholeLifeState,
            })
          }}
          min={0}
          id="exp2-whole-life-state-input"
          value={props.value}
        />
        <Button
          className="exp2-additional-btn"
          small
          icon="eraser"
          disabled={props.isLock}
          outlined
          title={i18n.t(i18nKeys.base_clear_zero)}
          onClick={() => {
            props.onChange({
              type: 'whole_life_state',
              value: 0,
            })
          }}
        />
      </FormGroup>
    </div>
  )
}
