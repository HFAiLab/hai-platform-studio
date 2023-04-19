import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { Pod } from '@hai-platform/shared'
import { getNodesPerfGrafanaURL } from '@hai-platform/shared'
import { Button, Callout, Collapse, EditableText, Position } from '@hai-ui/core'
import { Drawer, DrawerSize } from '@hai-ui/core/lib/esm/components/drawer/drawer'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import type { Chain } from '../../../../../model/Chain'
import { JobComponentV2 } from '../../../../../ui-components/jobCell'
import { icons } from '../../../../../ui-components/svgIcon'
import { SVGWrapper } from '../../../../../ui-components/svgWrapper'
import { simpleCopy } from '../../../../../utils/copyToClipboard'
import type { OpenURLInNewTabParams } from '../../../schema'

export interface GrafanaExplorerPanel1Props {
  chain: Chain
  onClose: () => void
  invokeOpenGrafana?(config: OpenURLInNewTabParams): void
}

const getDefaultNodeIDsFromChain = (chain: Chain) => {
  return new Set(chain.pods.map((pod) => pod.node))
}

export const GrafanaExplorerPanel1 = (props: GrafanaExplorerPanel1Props) => {
  const [subPanel1Open, setSubPanel1Open] = useState(true)
  let show_pods: Pod[] = []
  const [selectNodes, setSelectNodes] = useState(getDefaultNodeIDsFromChain(props.chain))
  const [tabAlias, setTabAlias] = useState<string>('')
  if (props.chain && props.chain.pods.length) {
    show_pods = [...props.chain.pods]
    // for (let i = 0; i < 100; i += 1) {
    //   show_pods = [...show_pods, ...props.chain.pods]
    // }
  }

  const getBeginAndEndTimeStamp = (beginRaw: string, endRaw: string | Date) => {
    const beginTimeStamp = dayjs(beginRaw).valueOf()
    const endTimeStamp = dayjs(endRaw).valueOf()
    const duration = endTimeStamp - beginTimeStamp
    const buff = Math.ceil(duration * 0.05)
    return {
      begin: beginTimeStamp - buff,
      end: endTimeStamp + buff,
    }
  }

  const selectAll = () => {
    const allNodes = props.chain.pods.map((item) => item.node)
    setSelectNodes(new Set(allNodes))
  }
  const clearAll = () => {
    selectNodes.clear()
    setSelectNodes(new Set([]))
  }

  const formatDate = (raw: string) => {
    return dayjs(raw).format('YYYY-MM-DD HH:mm:ss')
  }

  const isFinished = props.chain.queue_status === 'finished'

  const getGrafanaURL = () => {
    const { begin, end } = getBeginAndEndTimeStamp(
      props.chain.begin_at,
      isFinished ? props.chain.end_at : new Date(),
    )
    const urlEnd = props.chain.chain_status !== 'finished' ? 'now' : end

    const nodeQueryStr = [...selectNodes].map((node) => `var-Node=${node}`).join('&')
    return getNodesPerfGrafanaURL({
      begin,
      end: urlEnd,
      nodeQueryStr,
    })
  }

  const grafanaURL = getGrafanaURL()

  const isExternalNodeName = () => {
    return !!props.chain.pods.length && /^hfai-rank/.test(`${props.chain.pods[0]?.node}`)
  }

  const getDefaultTabAlias = () => {
    const nbName = props.chain.nb_name.slice(0, 12) + (props.chain.nb_name.length > 12 ? '...' : '')
    const allNodes = [...selectNodes]
    const nodesStr = allNodes.slice(0, 10).join(',') + (allNodes.length > 10 ? '...' : '')
    return `G-[${nbName}]- ${nodesStr}`
  }

  return (
    <div className="grafana-sub-panel hf">
      <Button
        onClick={() => {
          setSubPanel1Open(!subPanel1Open)
        }}
      >
        Infiniband TimescaleDB / Infiniband Node
      </Button>
      <Collapse className="grafana-panel1-container" isOpen={subPanel1Open} keepChildrenMounted>
        <div className="grafana-panel1-title">
          <p className="title">选择节点生成链接</p>
          <Button small outlined onClick={clearAll}>
            {i18n.t(i18nKeys.biz_validate_clear_all)}
          </Button>
          &nbsp;&nbsp;
          <Button small onClick={selectAll}>
            {i18n.t(i18nKeys.biz_validate_select_all)}
          </Button>
        </div>
        <div className="grafana-panel1-meta">
          <p>任务开始时间：{formatDate(props.chain.begin_at)}</p>
          {isFinished && <p>任务结束时间：{formatDate(props.chain.end_at)}</p>}
        </div>
        {props.chain.begin_at_list.length >= 2 && (
          <Callout intent="warning" className="grafana-warning-tip">
            节点存在被打断的情况，开始时间并非整个实验的开始时间
          </Callout>
        )}
        {isExternalNodeName() && (
          <Callout intent="warning" className="grafana-warning-tip">
            外部用户节点名已经隐藏，相关功能可能无法完全使用，如有更多需求请联系管理员
          </Callout>
        )}
        <div className="grafana-sub-1-nodes-container">
          {show_pods.map((item: Pod, index) => {
            return (
              <JobComponentV2
                key={item.job_id + item.node}
                clickHandler={(node) => {
                  if (selectNodes.has(node)) selectNodes.delete(node)
                  else selectNodes.add(node)
                  setSelectNodes(new Set([...selectNodes]))
                }}
                rank={index}
                pod={item}
                selected={selectNodes.has(item.node)}
                // filter={filter}
              />
            )
          })}
          {!show_pods.length && (
            <p>
              <i>当前任务未分配节点</i>
            </p>
          )}
        </div>
        <div className="grafana-operating-part">
          <Callout className="grafana-operating-url">
            <p>
              链接：{grafanaURL}
              <Button
                title={i18n.t(i18nKeys.biz_exp_log_clip_board)}
                icon={
                  <span aria-hidden="true" className="hai-ui-icon ">
                    <SVGWrapper width="16px" height="16px" svg={icons.copy} />
                  </span>
                }
                minimal
                small
                onClick={() => {
                  simpleCopy(String(grafanaURL), 'Grafana URL')
                }}
              />
            </p>
          </Callout>
          <div className="grafana-operating-line">
            <Button
              small
              outlined
              onClick={() => {
                if (props.invokeOpenGrafana) {
                  props.invokeOpenGrafana({
                    name: tabAlias || getDefaultTabAlias(),
                    url: grafanaURL,
                  })
                  props.onClose()
                }
              }}
            >
              在新 Tab 中打开
            </Button>
            <EditableText
              value={tabAlias}
              onChange={(value) => setTabAlias(value)}
              placeholder="点击设置标签别名..."
            />
          </div>
          <div className="grafana-operating-line">
            <Button
              small
              outlined
              onClick={() => {
                window.open(grafanaURL)
              }}
            >
              在独立页面中打开
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export interface GrafanaExplorerProps {
  isOpen: boolean
  onClose: () => void
  chain: Chain
  invokeOpenGrafana?(config: OpenURLInNewTabParams): void
}

export const GrafanaExplorer = (props: GrafanaExplorerProps) => {
  return (
    <Drawer
      isOpen={props.isOpen}
      className="grafana-drawer-container"
      onClose={() => {
        props.onClose()
      }}
      position={Position.LEFT}
      // backdropClassName={"app-drawer-backdrop"}
      hasBackdrop={false}
      size={DrawerSize.STANDARD}
      style={{ minWidth: '750px' }}
      title="Grafana 探索管理"
    >
      <div className="grafana-panel-container">
        <GrafanaExplorerPanel1
          chain={props.chain}
          onClose={props.onClose}
          invokeOpenGrafana={props.invokeOpenGrafana}
        />
      </div>
    </Drawer>
  )
}
