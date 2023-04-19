import { ApiServerApiName, ServiceTaskControlAction } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ContainerService, ContainerTask, ContainerTaskByAdmin } from '@hai-platform/shared'
import { ContainerTaskStatus, JupyterTaskStatusColorMap } from '@hai-platform/shared'
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import icon_error from '@hai-platform/studio-pages/lib/images/icon/icon_error.svg?raw'
import { dangerousDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { Colors } from '@hai-ui/colors'
import { Button, Callout, Icon, Menu, MenuItem, Popover, Tag } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2'
import React, { useEffect, useState } from 'react'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { conn } from '../../../../api/serverConnection'
import { AppToaster } from '../../../../utils'
import { copyWithTip } from '../../../../utils/clipboard'
import { commonAccessContainer, getAccessURL, getKernelURL } from '../../functions/Access'
import { ContainerIcon, isBuiltin } from '../utils'

import './service.scss'

export interface ServiceItemProps {
  containerInfo: ContainerTask
  refreshList: (options: { batch?: number }) => void
  service: ContainerService
  showServiceLog: () => void
}

const getServiceTypeInfo = (srvc: ContainerService) => {
  if (isBuiltin(srvc.name)) return ''

  if (srvc.type === 'local') {
    return 'local'
  }

  return `${srvc.type} / ${srvc.port}`
}

export const ServiceItem = (props: ServiceItemProps): JSX.Element => {
  const { service } = props
  const { status } = props.containerInfo
  const serviceName = service.name

  const [computedStatus, computedStatusRef, setComputedStatus] = useRefState(
    props.containerInfo.status,
  )

  const [computedAlive, setComputedAlive] = useState<boolean | undefined>(
    typeof service.alive === 'boolean' ? service.alive : true,
  )

  const [currentCheckInterval, currentCheckIntervalRef, updateCurrentCheckInterval] = useRefState<
    number | null
  >(null)

  const showServiceLog = () => {
    props.showServiceLog()
  }

  const updateComputedStatus = (nextStatus: ContainerTaskStatus) => {
    setComputedStatus(nextStatus)
  }

  // 控制单个 service 的逻辑
  const enableServiceControl =
    props.containerInfo.runtime_config_json.service_task?.version &&
    props.containerInfo.runtime_config_json.service_task.version >= 1 &&
    'alive' in service

  const controlShowRestartService =
    enableServiceControl && computedStatus === ContainerTaskStatus.RUNNING && computedAlive
  const controlShowStopService = controlShowRestartService
  const controlShowStartService =
    enableServiceControl && computedStatus === ContainerTaskStatus.RUNNING && !computedAlive

  const isContainerRunningButServiceDead =
    computedStatus === ContainerTaskStatus.RUNNING && !computedAlive

  const accessURL = getAccessURL(props.containerInfo as ContainerTaskByAdmin, serviceName)

  // const isContainerRunningButServiceDead = true

  const checkAccessInterval = () => {
    if (currentCheckIntervalRef.current) return

    if (service.name !== 'jupyter') {
      setComputedAlive(true)
      return
    }

    const intervalId = window.setInterval(() => {
      conn.getJupyterAccessibility(accessURL).then((res) => {
        // 测试环境下，res 是不存在的
        if (!res || res.accessibility) {
          // 这个时候是真的能访问了，容器应该变成 running、alive 应该变成 true
          clearInterval(intervalId)
          updateComputedStatus(ContainerTaskStatus.RUNNING)
          setComputedAlive(true)
          updateCurrentCheckInterval(null)
        }
      })
    }, 800)

    updateCurrentCheckInterval(intervalId)
  }

  const serviceControl = async (action: ServiceTaskControlAction) => {
    if (action !== ServiceTaskControlAction.START) {
      const confirm = await dangerousDialog(
        <div>
          {action === ServiceTaskControlAction.STOP && (
            <Callout className="service-item-attention-warning" intent="warning">
              停止 Jupyter 进程不会释放容器资源
            </Callout>
          )}
          <p>{`确认对服务执行 ${action} 操作？`}</p>
        </div>,
      )
      if (!confirm) return
    }

    GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_CONTROL, {
      id: props.containerInfo.id,
      service: props.service.name,
      action,
    })
      .then(() => {
        AppToaster.show({
          message:
            action === ServiceTaskControlAction.STOP
              ? `对服务执行 ${action} 成功`
              : `对服务执行 ${action} 成功，通常几秒后会自动更新状态`,
          intent: 'success',
          icon: 'tick',
        })
        if (action !== ServiceTaskControlAction.STOP && service.name === 'jupyter') {
          // 做可访问性测试
          setComputedAlive(false)
          checkAccessInterval()
        }
        props.refreshList({
          batch: 20,
        })
      })
      .catch((e) => {
        AppToaster.show({
          message: e,
          intent: 'danger',
          icon: 'error',
        })
      })
  }

  const copyKernelURL = () => {
    const kernelURL = getKernelURL(props.containerInfo as ContainerTaskByAdmin)
    copyWithTip(kernelURL)
  }

  useEffect(() => {
    // 容器没在运行，仅更新状态
    // 不是 jupyter 服务，也仅更新状态
    if (status !== ContainerTaskStatus.RUNNING || props.service.name !== 'jupyter') {
      updateComputedStatus(status)
      setComputedAlive(service.alive)
      return
    }

    // 停单个服务：
    if (!service.alive) {
      setComputedAlive(false)
      return
    }

    if (computedAlive && computedStatusRef.current === ContainerTaskStatus.RUNNING) return

    // hint: 只处理 jupyter 的，当前不是 running，但是下一个状态是 running 的情况
    // 这个时候我们需要做一个可访问性测试
    checkAccessInterval()

    // eslint-disable-next-line consistent-return
    return () => {
      if (currentCheckIntervalRef.current) {
        clearInterval(currentCheckIntervalRef.current)
        currentCheckIntervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.containerInfo.nb_name, serviceName, status, service.alive])

  return (
    <div className="service-item">
      <ContainerIcon type={serviceName} />
      <div className="service-item-db-attr">
        <div className="item-attr-li">
          {isContainerRunningButServiceDead && (
            <Tooltip2
              hoverCloseDelay={200}
              placement="top"
              className="item-stopped-container"
              content={<span>{i18n.t(i18nKeys.biz_container_process_exit)}</span>}
            >
              <SVGWrapper svg={icon_error} dClassName="item-stopped" />
            </Tooltip2>
          )}
          <Tag className="li-tag" minimal intent="none">
            {isBuiltin(serviceName) ? 'builtin' : 'custom'}
          </Tag>
          <p className="li-info">{serviceName}</p>
        </div>
      </div>
      <div className="service-item-expand" />
      <div className="item-attr-li">
        <p className="li-info">{getServiceTypeInfo(service)}</p>
      </div>
      <div className="item-attr-li">
        {controlShowStartService && (
          <Button
            className="jupyter-op"
            small
            intent="primary"
            minimal
            onClick={() => {
              serviceControl(ServiceTaskControlAction.START)
            }}
          >
            {i18n.t(i18nKeys.base_start)}
          </Button>
        )}

        {!isContainerRunningButServiceDead &&
          computedStatus === ContainerTaskStatus.RUNNING &&
          service.type !== 'local' && (
            <Button
              className="jupyter-op"
              small
              intent="primary"
              style={{
                backgroundColor: JupyterTaskStatusColorMap[ContainerTaskStatus.RUNNING],
              }}
              onClick={() => {
                commonAccessContainer(props.containerInfo as ContainerTaskByAdmin, serviceName)
              }}
            >
              {i18n.t(i18nKeys.base_access)}
            </Button>
          )}
        {isContainerRunningButServiceDead &&
          service.type !== 'local' &&
          computedStatus === ContainerTaskStatus.RUNNING && (
            <Tooltip2
              hoverCloseDelay={0}
              placement="top"
              className="item-btn-container disable"
              content={<span>{i18n.t(i18nKeys.biz_container_process_exit)}</span>}
            >
              <Button
                className="jupyter-op"
                small
                intent="primary"
                loading={!!currentCheckInterval}
                disabled
                style={{
                  backgroundColor: JupyterTaskStatusColorMap[ContainerTaskStatus.RUNNING],
                }}
                onClick={() => {
                  commonAccessContainer(props.containerInfo as ContainerTaskByAdmin, serviceName)
                }}
              >
                {i18n.t(i18nKeys.base_access)}
              </Button>
            </Tooltip2>
          )}

        {computedStatus !== ContainerTaskStatus.RUNNING && (
          <p className="item-tip-other">{i18n.t(i18nKeys.biz_container_access_after_restart)}</p>
        )}

        <Popover
          placement="bottom"
          interactionKind="click"
          className="service-item-more-pop"
          popoverClassName="service-item-more-opts"
          inheritDarkTheme={false}
          content={
            <Menu>
              {controlShowRestartService && (
                <MenuItem
                  intent="primary"
                  onClick={() => {
                    serviceControl(ServiceTaskControlAction.RESTART)
                  }}
                  text={i18n.t(i18nKeys.base_restart)}
                />
              )}
              {controlShowStopService && (
                <MenuItem
                  intent="danger"
                  onClick={() => {
                    serviceControl(ServiceTaskControlAction.STOP)
                  }}
                  text={i18n.t(i18nKeys.biz_exp_status_stop)}
                />
              )}
              <MenuItem
                text={i18n.t(i18nKeys.base_view_service_log)}
                onClick={showServiceLog}
                intent="warning"
              />
              {service.name === 'jupyter' && (
                <MenuItem
                  disabled={computedStatus !== ContainerTaskStatus.RUNNING}
                  text={i18n.t(i18nKeys.biz_jupyter_copy_kernel_url)}
                  onClick={copyKernelURL}
                  intent="none"
                />
              )}
              {!isBuiltin(service.name) && service?.startup_script && (
                <MenuItem
                  onClick={() => {
                    copyWithTip(service.startup_script)
                  }}
                  text={i18n.t(i18nKeys.biz_container_copy_startup_script)}
                  intent="primary"
                />
              )}
            </Menu>
          }
        >
          <Icon size={14} color={Colors.GRAY3} intent="none" icon="more" />
        </Popover>
      </div>
    </div>
  )
}
