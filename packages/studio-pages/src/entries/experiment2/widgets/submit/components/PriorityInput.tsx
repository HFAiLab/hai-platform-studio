import { i18n, i18nKeys } from '@hai-platform/i18n'
import { priorityToName } from '@hai-platform/shared'
import { Button, FormGroup, InputGroup, MenuItem } from '@hai-ui/core/lib/esm'
import { Select } from '@hai-ui/select'
import React, { useContext } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { PriorityInfo } from '../../../schema'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2PriorityInputProps extends SubmitCommonInputProps {
  isCurrentBackgroundTask: boolean
  value: number
  priorityList: Array<PriorityInfo>
  availablePriorities: Set<number>
}

const PrioritySelect = Select.ofType<PriorityInfo>()

export const Exp2PriorityInput = (props: Exp2PriorityInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifPriorityChangeInDraft = IfParamChangeInDraft(state, 'priority')

  const selectDisabled = props.isLock

  const outdated = !props.availablePriorities.has(props.value)
  return window._hf_user_if_in ? (
    <div className="exp2-form-group-container">
      {ifPriorityChangeInDraft && !props.isCurrentBackgroundTask && (
        <Exp2EditTip
          value={`${priorityToName(state.createDraft.priority!)}`}
          isLock={props.isLock}
        />
      )}
      <FormGroup
        inline
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_submit_priority),
          helperText: i18n.t(i18nKeys.biz_exp_submit_priority_helper),
        })}
      >
        {!props.isCurrentBackgroundTask && (
          <PrioritySelect
            fill
            filterable={false}
            items={props.priorityList}
            // eslint-disable-next-line react/no-unstable-nested-components
            itemRenderer={(i, { handleClick }) => {
              return (
                <MenuItem
                  active={i.value === props.value}
                  key={i.name}
                  onClick={handleClick}
                  text={`${i.name}`}
                  disabled={!props.availablePriorities.has(i.value)}
                />
              )
            }}
            popoverProps={{ minimal: true }}
            activeItem={props.priorityList.find((i) => i.value === props.value)}
            onItemSelect={(item) => {
              props.onChange({ type: 'priority', value: item.value })
            }}
            disabled={selectDisabled}
          >
            <Button
              id="exp2-priority-btn"
              rightIcon="caret-down"
              className="exp2-submit-common-select-btn"
              small
              loading={props.isLoading}
              disabled={selectDisabled}
              title={priorityToName(props.value)}
            >
              {!props.isLock && outdated ? `(${i18n.t(i18nKeys.base_inv)}) ` : ''}
              {priorityToName(props.value)}
            </Button>
          </PrioritySelect>
        )}
        {props.isCurrentBackgroundTask && (
          <InputGroup
            name="priority"
            className="hf-input middle"
            disabled
            min={1}
            fill
            value="AUTO"
          />
        )}
      </FormGroup>
    </div>
  ) : null
}
