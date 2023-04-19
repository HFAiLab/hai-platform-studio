import { ApiServerApiName, ServiceTaskControlAction } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ContainerTaskStatus } from '@hai-platform/shared'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import React from 'react'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { AppToaster } from '../../../../utils'
import { commonAccessContainer } from '../../functions/Access'
import { ContainerIcon, isBuiltin } from '../utils'
import type { ExtendContainerTaskByAdmin, ServiceCountInfo } from './compute'

interface ServiceCellProps {
  countService: ServiceCountInfo
  onClick?: () => void
  popOverNode?: ReactNode
  clickable?: boolean
  className?: string
}

// 服务的单元格
export const ServiceCell = React.memo(
  (props: ServiceCellProps) => {
    return (
      <div
        title="点击以执行更多操作"
        className={classNames(
          'cell-n icons w-180 service',
          {
            clickable: props.clickable,
          },
          props.className || '',
        )}
        onClick={(e) => {
          if (props.clickable && props.onClick) {
            e.stopPropagation()
            e.preventDefault()
            props.onClick()
          }
        }}
      >
        {props.popOverNode || null}
        {Object.keys(props.countService).map((type) => {
          return props.countService[type as keyof ServiceCountInfo] ? (
            <div className="service--logo-container">
              <ContainerIcon className="service-logo" type={type} />×
              {props.countService[type as keyof ServiceCountInfo]}
            </div>
          ) : (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>
          )
        })}
      </div>
    )
  },
  (currentProps, nextProps) => {
    return (
      currentProps.countService.custom === nextProps.countService.custom &&
      currentProps.countService.jupyter === nextProps.countService.jupyter &&
      currentProps.countService.ssh === nextProps.countService.ssh &&
      currentProps.popOverNode === nextProps.popOverNode &&
      currentProps.clickable === nextProps.clickable &&
      currentProps.onClick === nextProps.onClick
    )
  },
)

interface ServicePopOverProps {
  taskInfo: ExtendContainerTaskByAdmin
  showServiceLog: (serviceName: string) => void
}

// 服务的弹出
export const ServicePopOver = (props: ServicePopOverProps) => {
  const serviceControl = (name: string, action: ServiceTaskControlAction) => {
    GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_CONTROL, {
      id: props.taskInfo.id,
      service: name,
      action,
    })
      .then(() => {
        AppToaster.show({
          message:
            action === ServiceTaskControlAction.START
              ? `对服务执行 ${action} 成功，ingress 生效需要多等待几秒`
              : `对服务执行 ${action} 成功，通常几秒后会自动更新状态`,
          intent: 'success',
          icon: 'tick',
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

  return (
    <div className="cell-pop-over-main">
      {props.taskInfo.builtin_services.map((service) => {
        const enableServiceControl =
          props.taskInfo.runtime_config_json.service_task?.version &&
          props.taskInfo.runtime_config_json.service_task.version >= 1 &&
          'alive' in service

        const controlShowRestartService =
          enableServiceControl &&
          props.taskInfo.status === ContainerTaskStatus.RUNNING &&
          service.alive
        const controlShowStopService = controlShowRestartService
        const controlShowStartService =
          enableServiceControl &&
          props.taskInfo.status === ContainerTaskStatus.RUNNING &&
          !service.alive

        return (
          <div className="service-item-li">
            <div className="item-li-tag">{isBuiltin(service.name) ? 'builtin' : 'custom'}</div>
            <div>{service.name}</div>
            <div className="flex-1" />

            {controlShowRestartService && (
              <button
                className="hfp-btn primary"
                onClick={() => {
                  serviceControl(service.name, ServiceTaskControlAction.RESTART)
                }}
              >
                {i18n.t(i18nKeys.base_restart)}
              </button>
            )}
            {controlShowStopService && (
              <button
                className="hfp-btn danger"
                onClick={() => {
                  serviceControl(service.name, ServiceTaskControlAction.STOP)
                }}
              >
                {i18n.t(i18nKeys.biz_exp_status_stop)}
              </button>
            )}
            {controlShowStartService && (
              <button
                className="hfp-btn primary"
                onClick={() => {
                  serviceControl(service.name, ServiceTaskControlAction.START)
                }}
              >
                {i18n.t(i18nKeys.base_start)}
              </button>
            )}
            {service.name === 'jupyter' && (
              <button
                className="hfp-btn success"
                disabled={service.alive === false}
                onClick={() => {
                  commonAccessContainer(props.taskInfo, service.name)
                }}
                title={service.alive ? '' : '服务已经退出'}
              >
                访问
              </button>
            )}
            <button
              className="hfp-btn warn"
              onClick={() => {
                props.showServiceLog(service.name)
              }}
            >
              日志
            </button>
          </div>
        )
      })}
      {Object.values(props.taskInfo.runtime_config_json.service_task?.services || {})
        .filter((service) => !isBuiltin(service.name))
        .map((service) => {
          return <div>{service.name}</div>
        })}
    </div>
  )
}
