import { i18n, i18nKeys } from '@hai-platform/i18n'
import { FormGroup } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface WorkerInputProps extends SubmitCommonInputProps {
  value: number
  isCurrentBackgroundOrHalfTask: boolean
}

export const Exp2WorkerInput = (props: WorkerInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifWorkerChangeInDraft = IfParamChangeInDraft(state, 'worker')

  return (
    <div className="exp2-form-group-container">
      {/* 特殊的比如半节点任务、background 任务就不展示了，省的给人迷惑 */}
      {ifWorkerChangeInDraft && !props.isCurrentBackgroundOrHalfTask && (
        <Exp2EditTip value={`${state.createDraft.worker}`} isLock={props.isLock} />
      )}
      <FormGroup
        inline
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_submit_worker),
          helperText: i18n.t(i18nKeys.biz_exp_submit_worker_helper),
        })}
        labelFor="exp2-worker-select"
      >
        <input
          id="exp2-worker-select"
          type="number"
          name="worker"
          className="hf-input middle exp-submit-number-input"
          disabled={props.isLock || props.isCurrentBackgroundOrHalfTask}
          onChange={(e) => {
            const worker = Number(e.target.value)
            if (Number.isNaN(worker)) return
            props.onChange({ type: 'worker', value: worker })
          }}
          min={1}
          value={props.isLoading ? '' : props.value}
        />
      </FormGroup>
    </div>
  )
}
