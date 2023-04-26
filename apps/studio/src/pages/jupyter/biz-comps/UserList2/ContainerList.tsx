import { ApiServerApiName } from '@hai-platform/client-api-server'
import type {
  NodePortGroup,
  ServiceTaskAllTasksApiResult,
  ServiceTaskTasksApiResult,
} from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ContainerService, ContainerTask, ContainerTaskByAdmin } from '@hai-platform/shared'
import {
  ContainerTaskStatus,
  JupyterTaskStatusColorMap,
  getDefaultJupyterGroupPrefixRegex,
} from '@hai-platform/shared'
import type { PodObj } from '@hai-platform/studio-pages/lib'
import { dangerousDialog } from '@hai-platform/studio-pages/lib/ui-components/dialog'
import { HFLoading } from '@hai-platform/studio-pages/lib/ui-components/HFLoading'
import { RefreshBtn } from '@hai-platform/studio-pages/lib/ui-components/refresh'
import {
  Button,
  Callout,
  Collapse,
  Drawer,
  DrawerSize,
  Icon,
  NumericInput,
  Position,
  Tag,
} from '@hai-ui/core'
import { FormGroup } from '@hai-ui/core/lib/esm/components'
import { Dialog } from '@hai-ui/core/lib/esm/components/dialog/dialog'
import { Tooltip2 } from '@hai-ui/popover2'
import classNames from 'classnames'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GrootStatus } from 'use-groot'
import { GlobalApiServerClient } from '../../../../api/apiServer'
import { NoData } from '../../../../components/Errors/NoData'
import { InputGroupWithCheck } from '../../../../components/Input'
import { AppToaster, LevelLogger, getToken, getUserName } from '../../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../../utils/countly'
import { TaskOperation } from '../../functions/TaskOperation'
import { formatCPU, formatMem } from '../utils'
import { ContainerDetail } from './ContainerDetail'
import { ContainerCreator } from './Creator'
import type { ContainerMockChain } from './LogDrawer'
import { LogDrawer } from './LogDrawer'
import { NodePortItem } from './NodePortItem'
import { ServiceItem } from './ServiceItem'

interface HubGroupDataType {
  [key: string]: ContainerTask[]
}

interface ContainerListProps {
  data: ServiceTaskTasksApiResult | ServiceTaskAllTasksApiResult | undefined | null
  refresh: () => void
  status: GrootStatus
}

export const ContainerList = React.memo((props: ContainerListProps): JSX.Element => {
  const [hideGroups, setHideGroups] = useState<string[]>([])
  const [showCreateNodePortDialog, setShowCreateNodePortDialog] = useState(false)
  const [currentNodePortUsageAlias, setCurrentNodePortUsageAlias] = useState('')
  const [currentDistPort, setCurrentDistPort] = useState(22)
  const [currentActiveTaskIdForNodePort, setCurrentActiveTaskIdForNodePort] = useState<
    number | null
  >(null)
  const [wanderingNodePorts, setWanderingNodePorts] = useState<NodePortGroup>({})
  const [containerInfoForLog, setContainerInfoForLog] = useState<ContainerMockChain | null>(null)
  const [checkpointSaving, setCheckpointSaving] = useState(false)
  const [firstRenderReady, setFirstRenderReady] = useState(false)
  const [editContainer, setEditContainer] = useState<ContainerTask | null>(null)
  const [showCreateContainer, setShowCreateContainer] = useState(false)
  const [isCreatingSpotContainer, setIsCreatingSpotContainer] = useState(false)
  const batchIntervalRefresh = useRef<number | null>(null)
  const [detailContainerInfo, setDetailContainerInfo] = useState<ContainerTask | null>(null)

  const showEditDrawer = Boolean(editContainer) || showCreateContainer

  const { data } = props
  const computedContainerListMap: HubGroupDataType = React.useMemo(() => {
    const hubGroupData: HubGroupDataType = {}
    if (!data) return hubGroupData
    for (const task of Object.values(data.tasks)) {
      if (hubGroupData[task.group] instanceof Array) {
        hubGroupData[task.group]!.push(task)
      } else {
        hubGroupData[task.group] = [task]
      }
    }
    return hubGroupData
  }, [data])

  const canAddNodePort =
    props.data &&
    (props.data as ServiceTaskTasksApiResult).nodeport_quota.quota >
      (props.data as ServiceTaskTasksApiResult).nodeport_quota?.used_quota

  // 是否拥有打断训练，挪一个节点来使用的权限
  // 个别人才能有权限看到：
  const canSuspend = props.data && (props.data as ServiceTaskTasksApiResult).can_suspend

  const nodePorts = data && (data as ServiceTaskTasksApiResult).nodeports
  const quota = data && (data as ServiceTaskTasksApiResult).quota

  const refreshList = (options?: { batch?: number }): void => {
    if (!options?.batch) {
      // 有正在进行的更新，就先直接 return 了
      if (batchIntervalRefresh.current) return
      props.refresh()
      return
    }

    if (batchIntervalRefresh.current) {
      batchIntervalRefresh.current += options.batch
      LevelLogger.info('batchIntervalRefresh add to current', batchIntervalRefresh.current)
      return
    }

    batchIntervalRefresh.current = options.batch
    LevelLogger.info('batchIntervalRefresh, new', batchIntervalRefresh.current)

    const intervalId = setInterval(() => {
      if (!batchIntervalRefresh.current || batchIntervalRefresh.current <= 0) {
        clearInterval(intervalId)
        batchIntervalRefresh.current = null
        return
      }
      batchIntervalRefresh.current -= 1
      props.refresh()
    }, 1500)
  }

  const createNodePort = (taskId: number, usage: string, distPort: number): void => {
    GlobalApiServerClient.request(ApiServerApiName.NODE_PORT_SVC, {
      id: taskId,
      usage,
      dist_port: distPort,
    })
      .then((res) => {
        AppToaster.show({
          message: `${res.msg}`,
          intent: 'success',
        })
        refreshList()
      })
      .catch((e) => {
        AppToaster.show({
          message: `${e}`,
          intent: 'danger',
        })
        refreshList()
      })
  }

  const deleteNodePort = (
    usage: string,
    port: number,
    task: { nbName?: string; taskId?: number },
  ): void => {
    GlobalApiServerClient.request(ApiServerApiName.DELETE_NODE_PORT_SVC, {
      usage,
      dist_port: port,
      nb_name: task.nbName,
      id: task.taskId,
    })
      .then(() => {
        AppToaster.show({
          message: `${i18n.t(i18nKeys.base_delete_success)}`,
          intent: 'success',
        })
        refreshList()
      })
      .catch((e) => {
        AppToaster.show({
          message: `${i18n.t(i18nKeys.base_delete_error)} ${e}`,
          intent: 'warning',
        })
      })
  }

  const deleteAllWanderNodePorts = () => {
    const promises: Promise<unknown>[] = []
    Object.keys(wanderingNodePorts || {}).forEach((key) => {
      const subNodePorts = wanderingNodePorts[key]
      subNodePorts?.forEach((nodePort) => {
        promises.push(
          GlobalApiServerClient.request(ApiServerApiName.DELETE_NODE_PORT_SVC, {
            usage: nodePort.alias,
            dist_port: nodePort.dist_port,
            nb_name: key,
          }),
        )
      })
    })
    Promise.all(promises)
      .then(() => {
        refreshList()
        AppToaster.show({
          message: `${i18n.t(i18nKeys.base_all_delete_success)}`,
          intent: 'success',
        })
      })
      .catch((e) => {
        AppToaster.show({
          message: `${i18n.t(i18nKeys.biz_part_delete_failed)} ${e}`,
          intent: 'success',
        })
      })
  }

  const saveCheckPoint = async (task: ContainerTask) => {
    const confirm = await dangerousDialog(
      <>
        <p>
          {i18n.t(i18nKeys.biz_jupyter_last_checkpoint, {
            last_time: task.last_checkpoint
              ? task.last_checkpoint
              : i18n.t(i18nKeys.biz_jupyter_no_checkpoint_time),
          })}
        </p>
        <p>{i18n.t(i18nKeys.biz_jupyter_checkpoint_tip)}</p>
      </>,
      i18n.t(i18nKeys.biz_jupyter_checkpoint_if_sure),
    )
    if (!confirm) return
    setCheckpointSaving(true)
    let res
    try {
      res = await GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_CHECKPOINT, {
        id: task.id,
      })
      AppToaster.show({
        message: i18n.t(i18nKeys.biz_jupyter_checkpoint_succ, {
          name: task.nb_name,
        }),
        intent: 'none',
        icon: 'tick',
      })
      refreshList()
      setCheckpointSaving(false)
      return
    } catch (e) {
      res = { msg: e }
    }
    setCheckpointSaving(false)
    AppToaster.show({
      message: i18n.t(i18nKeys.biz_jupyter_checkpoint_err, {
        name: task.nb_name,
        msg: `${res.msg}`,
      }),
      intent: 'warning',
      icon: 'warning-sign',
    })
  }

  useEffect(() => {
    if (!props.data) return
    const wanderings: NodePortGroup = {}
    for (const nodeportKey of Object.keys(
      (props.data as ServiceTaskTasksApiResult).nodeports || {},
    )) {
      if (!props.data.tasks.find((task) => task.nb_name === nodeportKey)) {
        wanderings[nodeportKey] = (props.data as ServiceTaskTasksApiResult).nodeports[nodeportKey]!
      }
    }
    setWanderingNodePorts(wanderings)
  }, [props.data])

  useLayoutEffect(() => {
    setFirstRenderReady(true)

    AilabCountly.safeReport(CountlyEventKey.containerEnterUserList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showContainerOrServiceLog = (containerInfo: ContainerTask, currentService?: string) => {
    setContainerInfoForLog({
      ...containerInfo,
      pods: [
        {
          node: containerInfo.assigned_nodes![0]!,
        } as unknown as PodObj,
      ],
      token: (containerInfo as ContainerTaskByAdmin).token || getToken(),
      currentService,
    })
  }

  const moveNode = (group: string) => {
    GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_MOVE_NODE, {
      group,
    })
      .then(() => {
        AppToaster.show({
          message: `${i18n.t(i18nKeys.base_req_success)}`,
          intent: 'success',
        })
      })
      .catch((e) => {
        AppToaster.show({
          message: `${e}`,
          intent: 'danger',
        })
      })
  }

  const canCreateSpotContainerNow =
    props.data &&
    ((props.data as ServiceTaskTasksApiResult).spot_jupyter_quota || 0) > 0 &&
    (props.data as ServiceTaskTasksApiResult).spot_jupyter_status?.can_create

  const getCanNotCreateSpotContainerDesc = () => {
    if (!props.data) return ''

    if (((props.data as ServiceTaskTasksApiResult).spot_jupyter_quota || 0) <= 0) {
      return i18n.t(i18nKeys.biz_container_create_spot_container_no_quota)
    }
    if ((props.data as ServiceTaskTasksApiResult).spot_jupyter_status?.max_num_exceeded) {
      return i18n.t(i18nKeys.biz_container_create_spot_container_max_num_exceeded)
    }
    if ((props.data as ServiceTaskTasksApiResult).spot_jupyter_status?.too_busy_to_create) {
      return i18n.t(i18nKeys.biz_container_create_spot_container_too_busy_to_create)
    }

    return i18n.t(i18nKeys.biz_container_create_spot_container_too_busy_to_create)
  }

  const taskOperationSuccessCallback = () => {
    refreshList()
  }

  return (
    <div className="container-list-wrapper">
      {(props.status === GrootStatus.init || props.status === GrootStatus.pending) && <HFLoading />}
      {checkpointSaving && (
        <div className="checkpoint-mask">
          <div className="loading-container">
            <div className="lds-dual-ring" />
            <p>{i18n.t(i18nKeys.biz_jupyter_checkpoint_loading)}</p>
          </div>
        </div>
      )}
      <Dialog
        isOpen={!!showCreateNodePortDialog}
        className="create-node-port-dialog"
        onClose={() => {
          setShowCreateNodePortDialog(false)
        }}
      >
        <div className="node-port-dialog-container">
          {!canAddNodePort && (
            <Callout intent="primary" className="node-callout">
              {i18n.t(i18nKeys.biz_container_export_no_quota)}
            </Callout>
          )}
          <FormGroup
            label={`${i18n.t(i18nKeys.biz_container_nodeport_dist_port)} (${i18n.t(
              i18nKeys.biz_container_nodeport_for_ssh_tip,
            )})`}
          >
            <NumericInput
              fill
              value={`${currentDistPort}`}
              placeholder=""
              onValueChange={(value) => {
                setCurrentDistPort(Math.min(Math.max(0, value), 65535))
              }}
            />
          </FormGroup>
          <FormGroup label={i18n.t(i18nKeys.biz_container_nodeport_alias)}>
            <InputGroupWithCheck
              fill
              value={currentNodePortUsageAlias}
              placeholder=""
              onChange={(e) => {
                setCurrentNodePortUsageAlias(e.target.value)
              }}
            />
          </FormGroup>
          <Button
            disabled={!canAddNodePort}
            intent="primary"
            onClick={() => {
              if (!currentActiveTaskIdForNodePort) return
              createNodePort(
                currentActiveTaskIdForNodePort,
                currentNodePortUsageAlias,
                currentDistPort,
              )
              setShowCreateNodePortDialog(false)
            }}
          >
            {i18n.t(i18nKeys.biz_container_add_nodeport)}
          </Button>
        </div>
      </Dialog>
      <LogDrawer
        containerInfoForLog={containerInfoForLog}
        onClose={() => {
          setContainerInfoForLog(null)
        }}
      />
      <Drawer
        isOpen={!!detailContainerInfo}
        onClose={() => {
          setDetailContainerInfo(null)
        }}
        position={Position.RIGHT}
        hasBackdrop={false}
        size={DrawerSize.SMALL}
        style={{ minWidth: '200px' }}
        title={detailContainerInfo?.nb_name || ''}
      >
        <div className="container-creator-drawer-wrapper">
          <ContainerDetail
            schema={
              (detailContainerInfo?.config_json.schema as unknown as Record<string, unknown>) || {}
            }
          />
        </div>
      </Drawer>
      <Drawer
        isOpen={showEditDrawer}
        onClose={() => {
          setEditContainer(null)
          setShowCreateContainer(false)
        }}
        position={Position.LEFT}
        hasBackdrop={false}
        size={DrawerSize.STANDARD}
        style={{ minWidth: '750px' }}
        title={
          editContainer
            ? i18n.t(i18nKeys.biz_container_edit_container)
            : i18n.t(i18nKeys.biz_container_create_container)
        }
      >
        <div className="container-creator-drawer-wrapper">
          <ContainerCreator
            data={props.data as ServiceTaskTasksApiResult}
            editContainer={editContainer}
            status={props.status}
            isCreatingSpotContainer={isCreatingSpotContainer}
            invokeToList={() => {
              setEditContainer(null)
              setShowCreateContainer(false)
            }}
          />
        </div>
      </Drawer>
      <div className="container-creator-btn-container">
        <Button
          className="creator-btn-in-list"
          intent="primary"
          onClick={() => {
            setShowCreateContainer(true)
            setEditContainer(null)
            setIsCreatingSpotContainer(false)
            refreshList()
          }}
        >
          {i18n.t(i18nKeys.biz_container_create_container)}
        </Button>
        {!window._hf_user_if_in && (
          <Tooltip2
            placement="top"
            content={
              canCreateSpotContainerNow
                ? i18n.t(i18nKeys.biz_container_create_spot_container_tip_short)
                : getCanNotCreateSpotContainerDesc()
            }
          >
            <div className="spot-btn-mask-container">
              <div
                className={classNames('spot-btn-mask', { active: !canCreateSpotContainerNow })}
              />
              <Button
                className="spot-btn"
                intent="primary"
                disabled={!canCreateSpotContainerNow}
                onClick={() => {
                  setIsCreatingSpotContainer(true)
                  setShowCreateContainer(true)
                  setEditContainer(null)
                  refreshList()
                }}
              >
                {i18n.t(i18nKeys.biz_container_create_spot_container)}
              </Button>
            </div>
          </Tooltip2>
        )}
        <div className="flex-1" />
        <RefreshBtn
          onClick={() => {
            refreshList()
          }}
        />
      </div>
      {!window._hf_user_if_in && (
        <Callout icon="info-sign" style={{ marginTop: 10, marginBottom: 20 }} intent="primary">
          {i18n.t(i18nKeys.biz_container_create_container_external_bind)}
        </Callout>
      )}
      {!!Object.keys(wanderingNodePorts).length && (
        <Callout
          icon="warning-sign"
          title={i18n.t(i18nKeys.biz_container_wander_nodeports)}
          intent="warning"
          className="wandering-nodeport-callout"
        >
          <div className="wandering-tip-container">
            <p className="tip-text">{i18n.t(i18nKeys.biz_container_wander_nodeports_tip)}</p>
            <Button small minimal intent="danger" onClick={deleteAllWanderNodePorts}>
              {i18n.t(i18nKeys.base_just_delete_all)}
            </Button>
          </div>

          {Object.keys(wanderingNodePorts).map((key) => {
            const nodePortList = wanderingNodePorts[key] || []
            return (
              <>
                <div className="common-container-header-name wandering-header-name">{key}</div>
                <div className="wandering-nodeport-container">
                  {nodePortList.map((nodePortInfo) => {
                    return (
                      <NodePortItem
                        nodePortInfo={nodePortInfo}
                        invokeDelete={() => {
                          deleteNodePort(nodePortInfo.alias, nodePortInfo.dist_port, {
                            nbName: key,
                          })
                        }}
                        containerStatus={ContainerTaskStatus.STOPPED}
                        userName={getUserName()}
                        className="wandering-item"
                      />
                    )
                  })}
                </div>
              </>
            )
          })}
        </Callout>
      )}
      {props.status === GrootStatus.success &&
        Object.keys(computedContainerListMap).length === 0 && (
          <div className="no-container-wrap">
            <NoData />
          </div>
        )}
      {Object.keys(computedContainerListMap).map((key) => {
        const showQuotaTip =
          quota &&
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          quota[key]!.running! > quota[key]!.quota! &&
          computedContainerListMap[key]?.find((container) => container.status === 'queued')

        const shouldShowSuspend =
          canSuspend &&
          quota &&
          !getDefaultJupyterGroupPrefixRegex().test(key) &&
          (quota[key] ? quota[key]!.not_working : 0) === 0
        return (
          <div className="container-group" key={key}>
            <div
              className="container-group-header"
              onClick={() => {
                if (hideGroups.includes(key)) {
                  hideGroups.splice(hideGroups.indexOf(key), 1)
                } else {
                  hideGroups.push(key)
                }
                setHideGroups([...hideGroups])
              }}
            >
              <span className="title">{key}</span>
              <span className="quota">
                {i18n.t(i18nKeys.biz_current_quota_used)} {quota?.[key]?.running}{' '}
                {i18n.t(i18nKeys.base_use)} / {quota?.[key]?.quota} {i18n.t(i18nKeys.base_total)}
              </span>
              {showQuotaTip && (
                <Tooltip2
                  placement="top"
                  className="checkpoint-tooltip"
                  content={<span>{i18n.t(i18nKeys.biz_container_quota_used_up)}</span>}
                >
                  <Tag intent="warning" className="quota-used-up">
                    Quota Used Up
                  </Tag>
                </Tooltip2>
              )}
              {shouldShowSuspend && (
                <div className="invoke-suspend">
                  <Button
                    minimal
                    small
                    intent="warning"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveNode(key)
                    }}
                  >
                    点这句话打断训练，挪一个节点来用
                  </Button>
                </div>
              )}
              <span className="group-header-expand" />
              <Icon
                icon="double-chevron-down"
                className={classNames('group-header-icon', {
                  collapse: hideGroups.includes(key),
                })}
              />
            </div>
            <Collapse isOpen={!hideGroups.includes(key)}>
              {(computedContainerListMap[key] as ContainerTask[]).map((containerInfo) => {
                const shouldHighlight = [
                  ContainerTaskStatus.RUNNING,
                  ContainerTaskStatus.QUEUED,
                ].includes(containerInfo.status)

                const QueuedAndQuotaUseUp =
                  showQuotaTip && containerInfo.status === ContainerTaskStatus.QUEUED

                return (
                  <div
                    className={classNames('container-unit', {
                      running: containerInfo.status === ContainerTaskStatus.RUNNING,
                    })}
                    key={containerInfo.id}
                  >
                    <div className="container-unit-header">
                      <div
                        className={classNames('container-unit-li', 'common-container-header-name', {
                          active: shouldHighlight,
                        })}
                      >
                        {!!containerInfo.config_json.schema.resource.is_spot && (
                          <Tag className="container-spot-tag">Spot</Tag>
                        )}
                        <p className="name">{containerInfo.nb_name}</p>
                      </div>
                      <div
                        className={classNames('container-unit-li yaml', {
                          active: shouldHighlight,
                        })}
                      >
                        <Button
                          className="yaml-btn"
                          small
                          minimal
                          onClick={() => {
                            setDetailContainerInfo(containerInfo)
                          }}
                        >
                          YAML
                        </Button>
                      </div>
                      <div className={classNames('container-unit-li status')}>
                        {shouldHighlight && (
                          <div
                            className="status-info-active"
                            style={{
                              backgroundColor: JupyterTaskStatusColorMap[containerInfo.status],
                            }}
                          >
                            {QueuedAndQuotaUseUp ? (
                              <Tooltip2 content="该分组的配额已经用完，请先停止掉已经运行的容器">
                                <span className="status-quota-used-up-small">Quota Used Up</span>
                              </Tooltip2>
                            ) : (
                              containerInfo.status
                            )}
                          </div>
                        )}
                        {!shouldHighlight && (
                          <div
                            className="status-info"
                            style={{
                              color: JupyterTaskStatusColorMap[containerInfo.status],
                            }}
                          >
                            {containerInfo.status}
                          </div>
                        )}
                      </div>

                      <div
                        className={classNames('container-unit-li header-db-attr w160', {
                          highlight: shouldHighlight,
                        })}
                      >
                        <div className="db-attr-li b" title={`容器环境: ${containerInfo.backend}`}>
                          {containerInfo.backend}
                        </div>
                      </div>
                      <div className={classNames('container-unit-li header-db-attr')}>
                        <div className="db-attr-li b">
                          CPU: {formatCPU(containerInfo.config_json.schema?.resource.cpu)}
                          &nbsp;&nbsp;MEM:
                          {formatMem(containerInfo.config_json.schema?.resource.memory)}
                        </div>
                      </div>
                      <div className="container-unit-li header-expand" />
                      <div className="container-unit-li header-op">
                        {window._hf_user_if_in &&
                          containerInfo.status === ContainerTaskStatus.RUNNING && (
                            <Button
                              className="jupyter-op"
                              small
                              minimal
                              intent="primary"
                              onClick={() => {
                                setCurrentActiveTaskIdForNodePort(containerInfo.id)
                                setShowCreateNodePortDialog(true)
                              }}
                            >
                              {i18n.t(i18nKeys.biz_container_add_nodeport)}
                            </Button>
                          )}
                        {containerInfo.status === ContainerTaskStatus.RUNNING &&
                          !window.is_hai_studio && (
                            <Tooltip2
                              hoverCloseDelay={200}
                              placement="top"
                              className="checkpoint-tooltip"
                              content={
                                <span>
                                  {i18n.t(i18nKeys.biz_jupyter_last_checkpoint, {
                                    last_time: containerInfo.last_checkpoint
                                      ? containerInfo.last_checkpoint
                                      : i18n.t(i18nKeys.biz_jupyter_no_checkpoint_time),
                                  })}
                                </span>
                              }
                            >
                              <Button
                                className="jupyter-op"
                                small
                                intent="primary"
                                minimal
                                onClick={() => {
                                  saveCheckPoint(containerInfo)
                                }}
                              >
                                {i18n.t(i18nKeys.biz_container_checkpoint)}
                              </Button>
                            </Tooltip2>
                          )}
                        {[ContainerTaskStatus.STOPPED, ContainerTaskStatus.FINISHED].includes(
                          containerInfo.status,
                        ) && (
                          <Button
                            className="jupyter-op"
                            small
                            minimal
                            intent="primary"
                            onClick={() => {
                              setEditContainer(containerInfo)
                            }}
                          >
                            {i18n.t(i18nKeys.base_edit)}
                          </Button>
                        )}
                        {[ContainerTaskStatus.STOPPED, ContainerTaskStatus.FINISHED].includes(
                          containerInfo.status,
                        ) && (
                          <Button
                            className="jupyter-op"
                            small
                            minimal
                            intent="primary"
                            onClick={() => {
                              TaskOperation.start(
                                containerInfo,
                                getToken(),
                                getUserName(),
                                taskOperationSuccessCallback,
                              )
                            }}
                          >
                            {i18n.t(i18nKeys.base_start)}
                          </Button>
                        )}
                        {[ContainerTaskStatus.STOPPED, ContainerTaskStatus.FINISHED].includes(
                          containerInfo.status,
                        ) ? (
                          <Button
                            className="jupyter-op"
                            small
                            intent="danger"
                            minimal
                            onClick={() => {
                              TaskOperation.deleteTask(containerInfo, taskOperationSuccessCallback)
                            }}
                          >
                            {i18n.t(i18nKeys.base_delete)}
                          </Button>
                        ) : (
                          <>
                            <Button
                              className="jupyter-op"
                              small
                              intent="primary"
                              minimal
                              onClick={() => {
                                TaskOperation.restartTask(
                                  containerInfo,
                                  taskOperationSuccessCallback,
                                )
                              }}
                            >
                              {i18n.t(i18nKeys.base_restart)}
                            </Button>
                            <Button
                              className="jupyter-op"
                              small
                              intent="danger"
                              minimal
                              onClick={() => {
                                TaskOperation.stop(containerInfo, taskOperationSuccessCallback)
                              }}
                            >
                              {i18n.t(i18nKeys.biz_exp_status_stop)}
                            </Button>
                          </>
                        )}
                        <Button
                          className="jupyter-op"
                          small
                          minimal
                          intent="warning"
                          onClick={() => {
                            showContainerOrServiceLog(containerInfo)
                          }}
                        >
                          {i18n.t(i18nKeys.biz_container_log_for_container)}
                        </Button>
                      </div>
                    </div>
                    {firstRenderReady && (
                      <div className="container-unit-body">
                        <div className="s-container">
                          <div className="service-list-container">
                            {(
                              Object.entries(
                                containerInfo.runtime_config_json.service_task?.services || {},
                              ) || ([] as ContainerService[])
                            )
                              .map(([serviceKey, serviceValue]) => {
                                return {
                                  ...serviceValue,
                                  name: serviceValue.name || serviceKey,
                                }
                              })
                              .filter((service) => service.name !== 'ssh')
                              .map((service) => {
                                return (
                                  <ServiceItem
                                    refreshList={refreshList}
                                    // key={`${containerInfo.id}_${service.name}`}
                                    containerInfo={containerInfo}
                                    service={service}
                                    showServiceLog={() => {
                                      showContainerOrServiceLog(containerInfo, service.name)
                                    }}
                                  />
                                )
                              })}
                            {!!(nodePorts?.[containerInfo.nb_name] || []).length &&
                              (nodePorts?.[containerInfo.nb_name] || []).map((nodePortInfo) => (
                                <NodePortItem
                                  // key={`${containerInfo.id}_${nodePortInfo.dist_port}`}
                                  containerStatus={containerInfo.status}
                                  userName={containerInfo.user_name}
                                  nodePortInfo={nodePortInfo}
                                  invokeDelete={() => {
                                    deleteNodePort(nodePortInfo.alias, nodePortInfo.dist_port, {
                                      taskId: containerInfo.id,
                                    })
                                  }}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </Collapse>
          </div>
        )
      })}
    </div>
  )
})
