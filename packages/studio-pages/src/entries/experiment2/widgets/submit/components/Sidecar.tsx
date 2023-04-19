import { SidecarInfoMap } from '@hai-platform/shared'
import { Checkbox } from '@hai-ui/core/lib/esm'
import React, { useContext } from 'react'
import { InWrapper } from '../../../../../ui-components/innerWrapper'
import * as uikit from '../../../../../ui-components/uikit'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

export interface Exp2SidecarProps extends SubmitCommonInputProps {
  value: string[]
  historyValue: string[]
}

export const Exp2Sidecar = (props: Exp2SidecarProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifSidecarChangeInDraft = IfParamChangeInDraft(state, 'sidecar')

  const changeSideCar = (sidecar: string) => {
    props.onChange({
      type: 'sidecar',
      value: props.value.includes(sidecar)
        ? props.value.filter((curr) => curr !== sidecar)
        : [...props.value, sidecar],
    })
  }

  return (
    <InWrapper className="sidecar-wrapper">
      <div className="exp2-form-group-container">
        <div className="exp2-sidecar">
          <uikit.Collapse
            title="Sidecar"
            desc={
              props.value
                ? props.value
                    .map((key) => SidecarInfoMap[key as keyof typeof SidecarInfoMap]?.alias || key)
                    .join(',')
                : 'None'
            }
          >
            <div className="exp2-sidecar-content">
              {ifSidecarChangeInDraft && (
                <Exp2EditTip value={`${state.createDraft.group}`} isLock={props.isLock} />
              )}
              <div className="sidecar-items">
                {Object.entries(SidecarInfoMap).map(([value, info]) => {
                  return (
                    <Checkbox
                      disabled={props.isLock}
                      checked={props.value.includes(value)}
                      label={info.alias}
                      onChange={() => {
                        changeSideCar(value)
                      }}
                    />
                  )
                })}
                {/* hint: 这里的作用是前后兼容，比如出现了一个客户端未定义的 sidecar，也可以支持 */}
                {props.historyValue
                  .filter((key) => !(key in SidecarInfoMap))
                  .map((key) => {
                    return (
                      <Checkbox
                        disabled={props.isLock}
                        checked={props.value.includes(key)}
                        label={key}
                        onChange={() => {
                          changeSideCar(key)
                        }}
                      />
                    )
                  })}
              </div>
            </div>
          </uikit.Collapse>
        </div>
      </div>
    </InWrapper>
  )
}
