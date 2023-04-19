import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { MountInfo } from '@hai-platform/shared'
import { mountCodeInfoMap, mountInfoToFormatString } from '@hai-platform/shared'
import { Checkbox } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { InWrapper } from '../../../../../ui-components/innerWrapper'
import * as uikit from '../../../../../ui-components/uikit'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2ExtraMountInputProps extends SubmitCommonInputProps {
  value: MountInfo
}

export const Exp2ExtraMountInput = (props: Exp2ExtraMountInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifExtraMountChangeInDraft = IfParamChangeInDraft(state, 'mount_extra')

  const extraMountsString = mountInfoToFormatString(props.value)

  const changeMountInfo = (key: keyof MountInfo) => {
    const nextValue = { ...props.value }
    nextValue[key] = !nextValue[key]
    props.onChange({
      type: 'mount_extra',
      value: nextValue,
    })
  }

  return (
    <InWrapper className="extra-mounts-wrapper">
      <div className="exp2-form-group-container">
        {ifExtraMountChangeInDraft && (
          <Exp2EditTip
            value={`${mountInfoToFormatString(state.createDraft.mount_extra!)}`}
            isLock={props.isLock}
          />
        )}
        <div className="extra-mount">
          <uikit.Collapse
            title={i18n.t(i18nKeys.biz_exp_submit_extra_mount)}
            desc={extraMountsString}
          >
            <div className="extra-mounts">
              {Object.entries(mountCodeInfoMap).map(([key, value]) => {
                return (
                  <Checkbox
                    disabled={props.isLock}
                    checked={props.value[key]}
                    label={value.alias}
                    onChange={() => {
                      changeMountInfo(key)
                    }}
                  />
                )
              })}
            </div>
          </uikit.Collapse>
        </div>
      </div>
    </InWrapper>
  )
}
