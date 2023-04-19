import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, ButtonGroup, InputGroup } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import React, { useState } from 'react'
import * as uikit from '../../../../../ui-components/uikit'

export interface EnvironmentEditorProps {
  envs: Array<[string, string]>
  imageEnvs: Record<string, string>
  disabled?: boolean
  onChange: (envs: Array<[string, string]>) => void
}

export const EnvironmentEditor = (props: EnvironmentEditorProps) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  const updateEnv = (index: number, key: string, value: string) => {
    const nextEnvs = [...props.envs]
    nextEnvs[index] = [key, value]
    if (props.onChange) {
      props.onChange(nextEnvs)
    }
  }

  const addEnv = () => {
    const newEnvs: Array<[string, string]> = [...props.envs, ['', '']]
    props.onChange(newEnvs)
  }

  const removeCurrentEnv = () => {
    if (activeIndex === -1) return
    const nextEnvs = [...props.envs]
    nextEnvs.splice(activeIndex, 1)
    let nextActiveIndex = activeIndex

    if (!nextEnvs.length) nextActiveIndex = -1
    if (activeIndex >= nextEnvs.length) nextActiveIndex = nextEnvs.length - 1

    setActiveIndex(nextActiveIndex)
    props.onChange(nextEnvs)
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
              disabled={props.disabled}
              className="pair-add-one-btn"
              onClick={(e) => {
                e.stopPropagation()
                addEnv()
              }}
            />
            <Button
              small
              icon="small-minus"
              disabled={props.disabled || !props.envs.length || activeIndex === -1}
              className="pair-add-one-btn"
              onClick={(e) => {
                e.stopPropagation()
                removeCurrentEnv()
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
      title={i18n.t(i18nKeys.biz_exp_submit_extra_envs)}
      titleTooltip={i18n.t(i18nKeys.biz_exp_submit_extra_desc)}
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
        {props.disabled && !Object.keys(props.imageEnvs).length && !props.envs.length && (
          <p>{i18n.t(i18nKeys.biz_exp_submit_set_envs_empty)}</p>
        )}
        {Object.keys(props.imageEnvs).map((key) => {
          return (
            <div className="pair-input" key={`default-${key}`}>
              <InputGroup
                disabled
                value={key}
                title={key}
                small
                className={classNames('pair-input-key')}
              />
              <InputGroup
                disabled
                value={props.imageEnvs[key]}
                small
                title={props.imageEnvs[key]}
                className={classNames('pair-input-value')}
              />
            </div>
          )
        })}
        {props.envs.map(([key, value], index) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="pair-input" key={index}>
              <InputGroup
                disabled={props.disabled}
                value={key}
                small
                id={`exp-submit-env-input-key-${index}`}
                className={classNames('pair-input-key', {
                  'active-input': !props.disabled && index === activeIndex,
                })}
                onFocus={() => {
                  setActiveIndex(index)
                }}
                onClick={() => {
                  setActiveIndex(index)
                }}
                onChange={(e) => {
                  updateEnv(index, e.target.value, value)
                }}
              />
              <InputGroup
                disabled={props.disabled}
                value={value}
                small
                id={`exp-submit-env-input-value-${index}`}
                onFocus={() => {
                  setActiveIndex(index)
                }}
                className={classNames('pair-input-value', {
                  'active-input': !props.disabled && index === activeIndex,
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    if (!props.disabled && index === props.envs.length - 1) {
                      addEnv()
                      setTimeout(() => {
                        const nextDom = document.getElementById(
                          `exp-submit-env-input-key-${index + 1}`,
                        )
                        if (!nextDom) return
                        nextDom.click()
                        nextDom.focus()
                      })
                    }
                  }
                }}
                onClick={() => {
                  setActiveIndex(index)
                }}
                onChange={(e) => {
                  updateEnv(index, key, e.target.value)
                }}
              />
            </div>
          )
        })}
      </div>
    </uikit.Collapse>
  )
}
