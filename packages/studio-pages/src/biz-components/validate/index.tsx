import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { Pod } from '@hai-platform/shared'
import type { IToaster } from '@hai-ui/core'
import { Button, Tab, Tabs } from '@hai-ui/core'
import React, { useState } from 'react'
import type { Chain } from '../../model/Chain'
import { JobComponent } from '../../ui-components/jobCell'

type OnValidateCallback = (config: ValidateConfig) => any

enum ValidateTypes {
  task = 'task',
  nodes = 'nodes',
}

export interface ValidateConfig {
  type: ValidateTypes
  ranks?: number[]
}

export interface IValidateProps {
  chain: Chain
  onCancel: () => void
  onValidate: OnValidateCallback
  toaster?: IToaster | null
}

export const ValidatePortal: React.FC<IValidateProps> = ({
  chain,
  onCancel,
  onValidate,
  toaster,
}) => {
  let show_pods: Pod[] = []
  const [selectTabId, setSelectTabId] = useState(ValidateTypes.task)
  const [selectRanks, setSelectRanks] = useState(new Set<number>())

  if (chain && chain.pods.length) {
    show_pods = [...chain.pods]
    // for(let i = 0; i < 100; i += 1) {
    //     show_pods = [...show_pods, ...chain.pods];
    // }
  }

  const selectAll = () => {
    const failedIds = chain.pods.map((_item, index) => index)
    setSelectRanks(new Set(failedIds))
  }
  const selectFailed = () => {
    const failedIds = chain.pods
      .map((_item, index) => index)
      .filter((i) => chain.pods[i]!.status === 'failed')
    setSelectRanks(new Set(failedIds))
  }
  const clearAll = () => {
    selectRanks.clear()
    setSelectRanks(new Set([]))
  }

  const Footer = (
    <div className="validate-footer">
      <Button
        onClick={() => {
          onCancel()
        }}
      >
        {i18n.t(i18nKeys.base_Cancel)}
      </Button>
      &nbsp;
      <Button
        intent="primary"
        onClick={() => {
          if (selectTabId === ValidateTypes.nodes && selectRanks.size === 0) {
            if (toaster)
              toaster.show({
                message: i18n.t(i18nKeys.biz_validate_none_select_error),
                intent: 'warning',
                icon: 'warning-sign',
              })
            return
          }

          onValidate({
            type: selectTabId,
            ranks: selectTabId === ValidateTypes.task ? undefined : [...selectRanks],
          })
        }}
      >
        {i18n.t(i18nKeys.biz_validate_start_validate)}
      </Button>
    </div>
  )

  const byTaskPanel = (
    <>
      <div className="validate-inner-container">
        <pre className="hfai-validate-pre">
          {i18n.t(i18nKeys.biz_vali_confirm_warn, {
            action: 'action'.toUpperCase(),
            showName: chain.showName,
          })}
        </pre>
      </div>
      {Footer}
    </>
  )

  const byNodesPanel = (
    <>
      <div className="validate-inner-container">
        <div className="nodes-inner-header">
          <Button small outlined onClick={clearAll}>
            {i18n.t(i18nKeys.biz_validate_clear_all)}
          </Button>
          &nbsp;&nbsp;
          <Button small onClick={selectAll}>
            {i18n.t(i18nKeys.biz_validate_select_all)}
          </Button>
          &nbsp;&nbsp;
          <Button small onClick={selectFailed}>
            {i18n.t(i18nKeys.biz_validate_select_failed)}
          </Button>
          <div className="inner-status">
            {i18n.t(i18nKeys.base_already_selected)}: {selectRanks.size} / {show_pods.length}
          </div>
        </div>
        <div className="validate-nodes-container">
          {show_pods.map((item: Pod, index: number) => (
            <JobComponent
              rank={index}
              clickHandler={() => {
                if (selectRanks.has(index)) selectRanks.delete(index)
                else selectRanks.add(index)
                setSelectRanks(new Set([...selectRanks]))
              }}
              key={item.node}
              pod={item}
              selected={selectRanks.has(index)}
            />
          ))}
        </div>
      </div>
      {Footer}
    </>
  )

  return (
    <div className="validate-portal-container hf">
      <Tabs
        id="validate-tab"
        selectedTabId={selectTabId}
        onChange={(newTabId: ValidateTypes) => {
          setSelectTabId(newTabId)
        }}
      >
        <Tab
          panelClassName="validate-panel validate-by-exp"
          id={ValidateTypes.task}
          title={i18n.t(i18nKeys.biz_validate_task)}
          panel={byTaskPanel}
        />
        <Tab
          panelClassName="validate-panel validate-by-nodes"
          id={ValidateTypes.nodes}
          title={i18n.t(i18nKeys.biz_validate_nodes)}
          panel={byNodesPanel}
        />
        <Tabs.Expander />
        <div className="validate-title">{i18n.t(i18nKeys.biz_validate_settings)}</div>
      </Tabs>
    </div>
  )
}
