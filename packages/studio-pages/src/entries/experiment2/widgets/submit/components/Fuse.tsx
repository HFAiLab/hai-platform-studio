import { FuseOptions } from '@hai-platform/shared'
import { Radio, RadioGroup } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { InWrapper } from '../../../../../ui-components/innerWrapper'
import * as uikit from '../../../../../ui-components/uikit'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2FuseProps extends SubmitCommonInputProps {
  value: string
}

export const Exp2Fuse = (props: Exp2FuseProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifFuseChangeInDraft = IfParamChangeInDraft(state, 'fffs_enable_fuse')

  const changeFuse = (enable_fuse: string) => {
    props.onChange({
      type: 'fffs_enable_fuse',
      value: enable_fuse,
    })
  }

  return (
    <InWrapper className="fuse-wrapper">
      <div className="exp2-form-group-container">
        <div className="exp2-fuse">
          <uikit.Collapse
            title="3FS Fuse"
            desc={FuseOptions.find((option) => option.value === props.value)?.key}
          >
            <div className="exp2-fuse-content">
              {ifFuseChangeInDraft && (
                <Exp2EditTip value={`${state.createDraft.group}`} isLock={props.isLock} />
              )}
              <div className="fuse-items">
                <RadioGroup
                  inline
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    changeFuse((e.target as HTMLInputElement).value)
                  }}
                  selectedValue={props.value}
                >
                  {FuseOptions.map(({ key, value }) => {
                    return <Radio disabled={props.isLock} inline label={key} value={value} />
                  })}
                </RadioGroup>
              </div>
            </div>
          </uikit.Collapse>
        </div>
      </div>
    </InWrapper>
  )
}
