import { i18n, i18nKeys } from '@hai-platform/i18n'
import React, { useContext, useEffect, useState } from 'react'
import * as uikit from '../../../../../ui-components/uikit'
import { ClusterHelper } from '../../../funcs/ClusterHelper'
import type { IEnv } from '../../../funcs/ExperimentHelper'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import { Exp2SubmitConfig } from '../config'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'
import { AddOptionButton, ExtraOptions } from './AddOptionButton'
import { EnvironmentEditor } from './environment'
import { ParametersEditor } from './parameters'
import { PyEnvSelectComponent } from './PyEnvSelect'
import { Exp2TagsInput } from './Tags'
import { Exp2watchdogTimeInput } from './WatchdogTime'

export interface Exp2ExtraOptionsProps extends SubmitCommonInputProps {
  py_venv: string
  envs: Array<[string, string]>
  parameters: Array<string>
  hfEnvList: IEnv[]
  imageEnvironments: Record<string, string>
  tags: string[]
  watchdogTime: number
}

export const Exp2ExtraOptions = (props: Exp2ExtraOptionsProps) => {
  const [displayOption, setDisplayOption] = useState<Set<ExtraOptions>>(new Set())
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const [expand, setExpand] = useState(false)

  const venvOutdated =
    props.py_venv !== Exp2SubmitConfig.VENV_NOT_SET_HOLDER &&
    !props.hfEnvList.find((i) => i.value === props.py_venv) &&
    !(`${props.py_venv}` ?? '').includes('[') // 用户自定义的 hai_env，通常用 env_name[user] 来命名

  const ifPyEnvChangeInDraft = IfParamChangeInDraft(state, 'py_venv')
  const ifEnvsChangeInDraft = IfParamChangeInDraft(state, 'envs')
  const ifParametersChangeInDraft = IfParamChangeInDraft(state, 'parameters')
  const ifTagsChangeInDraft = IfParamChangeInDraft(state, 'tags')
  const ifWatchDogTimeChangeInDraft = IfParamChangeInDraft(state, 'watchdog_time')

  const isDraft = {
    [ExtraOptions.Parameters]: ifParametersChangeInDraft,
    [ExtraOptions.WatchdogTime]: ifWatchDogTimeChangeInDraft,
    [ExtraOptions.Tags]: ifTagsChangeInDraft,
  } as Record<ExtraOptions, boolean>

  const isShow = {
    [ExtraOptions.Parameters]:
      displayOption.has(ExtraOptions.Parameters) || !!(props.parameters ?? []).length,
    [ExtraOptions.WatchdogTime]:
      displayOption.has(ExtraOptions.WatchdogTime) || !!props.watchdogTime,
    [ExtraOptions.Tags]: displayOption.has(ExtraOptions.Tags) || !!(props.tags ?? []).length,
  } as Record<ExtraOptions, boolean>

  const handleExtraEnable = (i: ExtraOptions) => {
    setDisplayOption(new Set([...displayOption, i]))
  }
  const handleExtraDisable = (i: ExtraOptions) => {
    const ns = new Set([...displayOption])
    ns.delete(i)
    setDisplayOption(ns)
    // 从状态里清掉
    if (i === ExtraOptions.Tags || i === ExtraOptions.Parameters) {
      props.onChange({
        type: i,
        value: [],
      })
    }
    if (i === ExtraOptions.WatchdogTime) {
      props.onChange({
        type: i,
        value: 0,
      })
    }
  }

  // environment 需要使用 TrainImage 接口来获取默认环境变量
  useEffect(() => {
    if (expand && !props.isLock && !state.sourceTrainImages) {
      ClusterHelper.getTrainImages({
        apiServerClient: srvc.app.api().getApiServerClient(),
        token: srvc.app.api().getToken(),
      }).then((value) => {
        srvc.dispatch({ type: 'sourceTrainImages', value })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expand, props.isLock, state.sourceTrainImages])

  return (
    <div className="extra-options">
      <uikit.Collapse
        controller={expand}
        handler={setExpand}
        title={i18n.t(i18nKeys.biz_exp_submit_extra_options)}
        titleTooltip={i18n.t(i18nKeys.biz_exp_submit_extra_options_desc)}
        hideDescWhenShow
        desc="hf_env, environments, parameters..."
      >
        <div className="extra-options-container">
          <div className="extra-options-unit">
            {ifPyEnvChangeInDraft && (
              <Exp2EditTip value={`${state.createDraft.py_venv}`} isLock={props.isLock} />
            )}
            <PyEnvSelectComponent
              hfEnvList={props.hfEnvList}
              py_venv={props.py_venv}
              onChange={props.onChange}
              isLock={props.isLock}
              isLoading={props.isLoading}
              venvOutdated={venvOutdated}
            />
          </div>
          <div className="extra-options-unit">
            {ifEnvsChangeInDraft && (
              <Exp2EditTip value={`${state.createDraft.envs?.join('\n')}`} isLock={props.isLock} />
            )}
            <EnvironmentEditor
              disabled={props.isLock}
              envs={props.envs}
              imageEnvs={props.imageEnvironments || {}}
              onChange={(envs) => {
                props.onChange({ type: 'envs', value: envs })
              }}
            />
          </div>
          {isShow.parameters && (
            <div className="extra-options-unit">
              {ifParametersChangeInDraft && (
                <Exp2EditTip
                  value={`${state.createDraft.parameters?.join('\n')}`}
                  isLock={props.isLock}
                />
              )}
              <ParametersEditor
                parameters={props.parameters}
                disabled={props.isLock}
                onChange={(params) => {
                  props.onChange({ type: 'parameters', value: params })
                }}
              />
            </div>
          )}
          {isShow.watchdog_time && (
            <div className="extra-options-unit">
              <Exp2watchdogTimeInput
                showEditTip={ifWatchDogTimeChangeInDraft}
                editTip={`${state.createDraft.watchdog_time}`}
                isLoading={props.isLoading}
                isLock={props.isLock}
                onChange={props.onChange}
                watchdogTime={props.watchdogTime}
              />
            </div>
          )}
          {isShow.tags && (
            <div className="extra-options-unit">
              <Exp2TagsInput
                showEditTip={ifTagsChangeInDraft}
                editTip={`${state.createDraft.tags?.join(',')}`}
                isLoading={props.isLoading}
                isLock={props.isLock}
                onChange={props.onChange}
                tags={props.tags}
              />
            </div>
          )}
          {!props.isLock && (
            <AddOptionButton
              handleOptionEnable={handleExtraEnable}
              handleOptionDisable={handleExtraDisable}
              draftMap={isDraft}
              optionMap={isShow}
            />
          )}
        </div>
      </uikit.Collapse>
    </div>
  )
}
