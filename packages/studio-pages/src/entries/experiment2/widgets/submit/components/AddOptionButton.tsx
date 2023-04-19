import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, Menu, MenuItem } from '@hai-ui/core/lib/esm/components'
import { Popover2 } from '@hai-ui/popover2/lib/esm/popover2'
import React from 'react'
import { Exp2EditTip } from '../widgets/EditTip'

export enum ExtraOptions {
  PyEnv = 'py_venv',
  Environment = 'envs',
  Parameters = 'parameters',
  Tags = 'tags',
  WatchdogTime = 'watchdog_time',
}
interface AddOptionButtonProps {
  optionMap: Record<ExtraOptions, boolean>
  draftMap: Record<ExtraOptions, boolean>
  handleOptionEnable(i: ExtraOptions): void
  handleOptionDisable(i: ExtraOptions): void
}
export const AddOptionButton = (props: AddOptionButtonProps) => {
  let buttonShowDraft = false
  for (const i in props.optionMap) {
    if (!props.optionMap[i as ExtraOptions] && props.draftMap[i as ExtraOptions]) {
      buttonShowDraft = true
    }
  }

  return (
    <Popover2
      minimal
      content={
        <Menu>
          {(Object.keys(props.optionMap) as ExtraOptions[]).map((i) => (
            <MenuItem
              text={
                <>
                  <span>{i}</span>
                  {props.draftMap[i] && <span className="has-edit-tip"> *</span>}
                </>
              }
              icon={props.optionMap[i] ? 'tick' : 'blank'}
              onClick={() => {
                if (props.optionMap[i]) {
                  props.handleOptionDisable(i)
                } else {
                  props.handleOptionEnable(i)
                }
              }}
            />
          ))}
        </Menu>
      }
      placement="bottom"
    >
      <Button
        className="extra-options-inner-unit"
        small
        icon="small-plus"
        rightIcon="more"
        style={{ marginTop: 4 }}
      >
        {buttonShowDraft && <Exp2EditTip value={i18n.t(i18nKeys.base_Cancel)} isLock={false} />}
        {i18n.t(i18nKeys.biz_exp_submit_extra_more)}
      </Button>
    </Popover2>
  )
}
