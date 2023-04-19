import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, ButtonGroup, InputGroup } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import React, { useState } from 'react'
import * as uikit from '../../../../../ui-components/uikit'

export interface ParametersEditorProps {
  parameters: Array<string>
  onChange: (params: Array<string>) => void
  disabled?: boolean
}

export const ParametersEditor = (props: ParametersEditorProps) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  // 当处于可编辑状态时，至少有个 input
  let toRenderParameters = props.parameters
  if (!props.disabled && toRenderParameters.length === 0) {
    toRenderParameters = ['']
  }

  const updateParam = (index: number, param: string) => {
    const nextParams = [...props.parameters]
    nextParams[index] = param
    props.onChange(nextParams.filter((p) => !!p))
  }

  const addParams = () => {
    props.onChange([...props.parameters, ''])
  }

  const removeCurrentParam = () => {
    if (activeIndex === -1) return
    const nextParams = [...props.parameters]
    nextParams.splice(activeIndex, 1)
    let nextActiveIndex = activeIndex

    if (!nextParams.length) nextActiveIndex = -1
    if (activeIndex >= nextParams.length) nextActiveIndex = nextParams.length - 1

    setActiveIndex(nextActiveIndex)
    props.onChange(nextParams)
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  const Operations = () => (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <div className="env-op-container">
      {!props.disabled && (
        <div className="pair-add-one">
          <ButtonGroup>
            <Button
              small
              icon="small-plus"
              disabled={!!props.disabled}
              className="pair-add-one-btn"
              onClick={(e) => {
                e.stopPropagation()
                addParams()
              }}
            />
            <Button
              small
              icon="small-minus"
              disabled={props.disabled || !props.parameters.length || activeIndex === -1}
              className="pair-add-one-btn"
              onClick={(e) => {
                e.stopPropagation()
                removeCurrentParam()
              }}
            />
          </ButtonGroup>
        </div>
      )}
    </div>
  )

  return (
    <uikit.Collapse
      defaultShow
      title={i18n.t(i18nKeys.biz_exp_submit_extra_parameters)}
      titleTooltip={i18n.t(i18nKeys.biz_exp_submit_extra_parameters_example)}
      // eslint-disable-next-line react/no-unstable-nested-components
      desc={(show) => {
        if (!show)
          return i18n.t(
            props.disabled
              ? i18nKeys.biz_exp_submit_expand_to_view
              : i18nKeys.biz_exp_submit_expand_to_set,
          )
        return <Operations />
      }}
    >
      <div className="pair-input-list">
        {props.disabled && !props.parameters.length && (
          <p>{i18n.t(i18nKeys.biz_exp_submit_set_params_empty)}</p>
        )}
        {toRenderParameters.map((param, index) => {
          return (
            <div className="pair-input">
              {/* hint: 这里贸然加 key，会造成无法编辑问题 */}
              <InputGroup
                small
                disabled={!!props.disabled}
                value={param}
                onChange={(e) => {
                  updateParam(index, e.target.value)
                }}
                className={classNames('pair-input-fill-line', {
                  'active-input': !props.disabled && index === activeIndex,
                })}
                onFocus={() => {
                  setActiveIndex(index)
                }}
                onClick={() => {
                  setActiveIndex(index)
                }}
              />
            </div>
          )
        })}
      </div>
    </uikit.Collapse>
  )
}
