import type { NodePort } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ContainerTaskStatus } from '@hai-platform/shared'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Button } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import classNames from 'classnames'
import React from 'react'
import NodePortSvg from '../../../../components/svg/nodeport.svg?raw'
import { copyWithTip } from '../../../../utils/clipboard'

export interface NodePortItemProps {
  nodePortInfo: NodePort
  invokeDelete: () => void
  containerStatus: ContainerTaskStatus
  userName: string
  className?: string
}

export const NodePortItem = (props: NodePortItemProps): JSX.Element => {
  const nodePortAddress = `${props.nodePortInfo.ip}:${props.nodePortInfo.src_port}`
  return (
    <div className={classNames('nodeport-item', props.className)}>
      <SVGWrapper svg={NodePortSvg} dClassName="service-item-logo" />
      <div className="service-item-flex-attr">{props.nodePortInfo.alias}</div>
      <div className="item-attr-li">
        <p className="li-title">{i18n.t(i18nKeys.base_address)}</p>
        <Tooltip2 placement="top" className="li-info address" content={<span>点击复制</span>}>
          <p
            onClick={() => {
              copyWithTip(nodePortAddress)
            }}
          >
            {props.nodePortInfo.ip}:{props.nodePortInfo.src_port}
          </p>
        </Tooltip2>
        <p className="li-title">{i18n.t(i18nKeys.biz_container_origin_port)}</p>
        <p className="li-info">{props.nodePortInfo.dist_port}</p>
        <Button
          className="jupyter-op"
          small
          minimal
          intent="danger"
          onClick={() => {
            props.invokeDelete()
          }}
        >
          {i18n.t(i18nKeys.base_delete)}
        </Button>
        {props.containerStatus === ContainerTaskStatus.RUNNING &&
          props.nodePortInfo.dist_port === 22 && (
            <Button
              className="jupyter-op"
              small
              minimal
              intent="primary"
              onClick={() => {
                const addr = `ssh ${props.userName ? `${props.userName}@` : ''}${
                  props.nodePortInfo.ip
                } -p ${props.nodePortInfo.src_port}`
                const msg = `${i18n.t(i18nKeys.biz_ssh_copy_success)} ${addr}`
                copyWithTip(addr, msg)
              }}
            >
              {i18n.t(i18nKeys.biz_copy_ssh_script)}
            </Button>
          )}
        {props.containerStatus !== ContainerTaskStatus.RUNNING && (
          <p className="item-tip-other">{i18n.t(i18nKeys.biz_container_access_after_restart)}</p>
        )}
      </div>
    </div>
  )
}
