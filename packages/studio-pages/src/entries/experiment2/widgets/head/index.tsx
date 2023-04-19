import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button } from '@hai-ui/core/lib/esm'
import classnames from 'classnames'
import type { CSSProperties } from 'react'
import React, { useContext } from 'react'
import { DynamicUpdate } from '../../../../ui-components/dynamicUpdate'
import { RefreshBtn } from '../../../../ui-components/refresh'
import { CountlyEventKey } from '../../../../utils/countly/countly'
import { ExpServiceContext } from '../../reducer'

interface PanelHeadProps {
  refresh: () => void
}

export const Exp2Head: React.FC<PanelHeadProps> = (props: PanelHeadProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc

  const { chain } = state
  const settingsLocked = state.mode === 'onlyRead' || state.mode === 'readControl'

  let updated = chain?.instance_updated_at.slice(2) || null // 去掉 20 开头的年份

  const currentEditorToShow =
    state.queryType === 'chainId' ? chain?.showName || '' : state.queryValue

  const isPy = currentEditorToShow.endsWith('.py')
  const isNano = currentEditorToShow.length < (isPy ? 11 : 8)
  const fn = isNano && isPy ? currentEditorToShow.slice(0, -3) : currentEditorToShow

  if (updated && !isNano) {
    updated = `${updated}`
  }

  const dynamicUpdateStyle: CSSProperties = {
    fontSize: '12px',
    height: 'max-content',
    lineHeight: 1.3,
    fontFamily: 'monospace',
  }

  return (
    <div className="panel-head-container">
      <div
        className={classnames({ panelHead: true, nano: isNano, normal: !isNano }, state.queryType)}
      >
        <div
          className={classnames(state.queryType, 'filename')}
          title={
            state.queryType === 'path'
              ? i18n.t(i18nKeys.biz_exp_opened_file)
              : i18n.t(i18nKeys.biz_exp_selected_chain)
          }
        >
          {fn}
          {isNano && isPy && <span>.py</span>}

          {settingsLocked && (
            <Button
              small
              minimal
              intent="warning"
              className="to-yaml"
              active={state.showYAML}
              onClick={() => {
                srvc.dispatch({
                  type: 'showYAML',
                  value: !state.showYAML,
                })
                if (!state.showYAML) {
                  srvc.app.api().countlyReportEvent(CountlyEventKey.Exp2ShowYaml)
                }
              }}
              title="以 yaml 格式展示"
            >
              YAML
            </Button>
          )}
        </div>
        <div className="refresh-btn-wrapper">
          <RefreshBtn
            small
            svgOnly
            onClick={() => {
              props.refresh()
            }}
          />
        </div>
      </div>
      {!chain && <div className="panel-no-task">{i18n.t(i18nKeys.biz_exp_no_task_found)}</div>}
      <div className="exp-meta-container">
        {updated && <DynamicUpdate value={updated} style={dynamicUpdateStyle} />}
      </div>
    </div>
  )
}
