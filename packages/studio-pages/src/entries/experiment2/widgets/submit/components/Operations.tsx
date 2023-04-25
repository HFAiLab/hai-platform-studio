import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ContainerTask } from '@hai-platform/shared'
import { TaskWorkerStatus } from '@hai-platform/shared'
import { Button, ButtonGroup } from '@hai-ui/core/lib/esm/components'
import { Select } from '@hai-ui/select'
import classNames from 'classnames'
import React, { useContext, useState } from 'react'
import { icons } from '../../../../../ui-components/svgIcon'
import { SVGWrapper } from '../../../../../ui-components/svgWrapper'
import { ExpServiceContext } from '../../../reducer'
import type { OpenURLInNewTabParams } from '../../../schema'
import { ExpServiceAbilityNames, ServiceNames } from '../../../schema'
import { GrafanaExplorer } from './grafana'

const JupyterSelect = Select.ofType<ContainerTask>()

export interface Exp2OperationsProps {
  isLock: boolean
  isCreating?: boolean
  submit: () => Promise<void>
  stop: () => Promise<unknown>
  resume: () => Promise<unknown>
}

export const Exp2Operations = (props: Exp2OperationsProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const [controlResumeOpen, setControlResumeOpen] = useState<boolean | null>(null)

  const canStopByChainStatus = state.chain && state.chain.queue_status !== 'finished'
  const canResumeByChainStatus = state.chain && state.chain.queue_status === 'finished'

  const canShowPerf = state.chain && state.chain.chain_status !== 'waiting_init'

  const isFailed = state.chain && state.chain.worker_status === TaskWorkerStatus.FAILED

  const hideSubmit = state.mode !== 'readWrite'
  const showOuterResume = hideSubmit
  const canStopExperiment = srvc.app.api().hasAbility(ExpServiceAbilityNames.stopExperiment)
  const canOpenJupyter = srvc.app.api().hasAbility(ExpServiceAbilityNames.openJupyter)
  const canShowGrafana = srvc.app.api().hasAbility(ExpServiceAbilityNames.grafana)
  const [showGrafanaExplorer, setShowGrafanaExplorer] = useState(false)

  const enableStop = canStopByChainStatus && canStopExperiment
  // 权限能力这里先暂时复用 canStopExperiment
  const canResume = canResumeByChainStatus && canStopExperiment

  const submitDisable = props.isLock || props.isCreating

  const showPerformance = () => {
    if (!state.chain) return
    srvc.app.api().invokeService(ServiceNames.showPerformance, {
      chain: state.chain,
      creatorQueryType: state.queryType,
    })
  }

  const defaultResumeOpen = !!isFailed
  const resumeOpen = controlResumeOpen === null ? defaultResumeOpen : !!controlResumeOpen

  const jupyterTasks =
    state.hubData?.tasks.filter((item) => {
      return (
        item.status === 'running' &&
        item.builtin_services.find((service) => service.name === 'jupyter')?.alive
      )
    }) || []

  return (
    <>
      <div className="exp2-setting-item" style={{ display: 'flex' }}>
        {!hideSubmit && (
          <ButtonGroup className="submit-btn-group op-outer">
            <Button
              small
              disabled={submitDisable}
              className="op-btn submit-btn"
              intent="primary"
              id="exp2-submit"
              onClick={() => {
                props.submit()
              }}
            >
              {props.isCreating && (
                <SVGWrapper
                  dClassName="loading-svg"
                  svg={icons.loading}
                  height="13"
                  width="13"
                  fill="#FFF"
                />
              )}
              {i18n.t(i18nKeys.biz_exp_submit_submit)}
            </Button>

            {!showOuterResume && (
              <div
                className={classNames('exp2-outer-resume-container', {
                  isOpen: resumeOpen,
                })}
              >
                <div className="hf-exp2-op-menu-container">
                  <Button
                    intent="primary"
                    className="hf-exp2-op-menu-item"
                    onClick={() => {
                      props.resume()
                    }}
                    minimal
                    small
                    disabled={!canResume}
                    title={i18n.t(i18nKeys.biz_exp_status_resume_title)}
                    text={`${i18n.t(i18nKeys.biz_exp_status_resume)}`}
                  />
                </div>
              </div>
            )}
            {!showOuterResume && (
              <Button
                active={resumeOpen}
                onClick={() => {
                  setControlResumeOpen(!resumeOpen)
                }}
                disabled={submitDisable}
                intent="primary"
                className="op-more-btn"
                small
                rightIcon="caret-down"
              />
            )}
          </ButtonGroup>
        )}
        {showOuterResume && (
          <Button
            small
            intent="primary"
            className="resume-btn op-outer op-btn"
            id="exp2-resume-btn"
            disabled={!canResume}
            title={i18n.t(i18nKeys.biz_exp_status_resume_title)}
            onClick={() => {
              props.resume()
            }}
          >
            {i18n.t(i18nKeys.biz_exp_status_resume)}
          </Button>
        )}
        <ButtonGroup className="stop-btn-group op-outer">
          <Button
            className="stop-btn op-btn"
            small
            intent="danger"
            id="exp2-stop-btn"
            disabled={!enableStop}
            onClick={() => {
              props.stop()
            }}
          >
            {i18n.t(i18nKeys.biz_exp_status_stop)}
          </Button>
        </ButtonGroup>
        {!window.is_hai_studio && (
          <Button
            small
            icon="timeline-line-chart"
            disabled={!canShowPerf}
            onClick={showPerformance}
            className="show-perf-btn op-outer op-btn"
          >
            {i18n.t(i18nKeys.biz_exp_perf)}
          </Button>
        )}
      </div>
      <div className="exp2-setting-item" style={{ display: 'flex' }}>
        <ButtonGroup className="exp2-open-jupyter op-outer">
          {canOpenJupyter && state.hubData && (
            <JupyterSelect
              fill
              popoverProps={{ position: 'bottom-right', minimal: true }}
              filterable={false}
              items={jupyterTasks}
              // eslint-disable-next-line react/no-unstable-nested-components
              itemRenderer={(item) => {
                return (
                  <div className="jupyter-item-container">
                    <p className="item-meta">
                      {item.group}-{item.nb_name}
                    </p>
                    <Button
                      small
                      minimal
                      intent="primary"
                      onClick={() => {
                        srvc.app.api().invokeService(ServiceNames.quickOpenJupyter, {
                          jupyterTask: item,
                          chain: state.chain,
                        })
                      }}
                    >
                      enter
                    </Button>
                  </div>
                )
              }}
              activeItem={null}
              onItemSelect={() => {}}
            >
              <Button
                disabled={!state.hubData.tasks.filter((item) => item.status === 'running').length}
                small
                rightIcon="caret-down"
                className="show-perf-btn"
              >
                Jupyter
              </Button>
            </JupyterSelect>
          )}
        </ButtonGroup>
        {!window.is_hai_studio && window._hf_user_if_in && canShowGrafana && (
          <Button
            small
            icon={<SVGWrapper svg={icons.grafana} dClassName="grafana-svg" />}
            onClick={() => setShowGrafanaExplorer(true)}
            className="show-perf-btn op-outer"
          >
            Grafana
          </Button>
        )}
      </div>

      <GrafanaExplorer
        chain={state.chain!}
        isOpen={showGrafanaExplorer}
        invokeOpenGrafana={(params: OpenURLInNewTabParams) => {
          srvc.app.api().invokeService(ServiceNames.openURLInNewTab, params)
        }}
        onClose={() => {
          setShowGrafanaExplorer(false)
        }}
      />
    </>
  )
}
