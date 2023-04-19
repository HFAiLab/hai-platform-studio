import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { ServiceTaskAllTasksApiResult } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ContainerTaskStatus } from '@hai-platform/shared'
import type { ClusterUnit, ContainerTask, ContainerTaskByAdmin } from '@hai-platform/shared'
import { useFocusInterval } from '@hai-platform/studio-pages/lib/hooks/useFocusInterval'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import type { PodObj } from '@hai-platform/studio-schemas'
import { bytesToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import { Button, Checkbox, Dialog, Icon } from '@hai-ui/core/lib/esm'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../../api/ailabServer'
import CommonUserSvg from '../../../../components/svg/common-user.svg?raw'
import { WebEventsKeys, hfEventEmitter } from '../../../../modules/event'
import { getCurrentAdminURL, getCurrentClusterServerURL, getToken } from '../../../../utils'
import { TaskOperation } from '../../functions/TaskOperation'
import { ContainerStatus } from '../../widgets/ContainerStatus'
import { PercentageBar } from '../../widgets/PercentageBar'
import type { ContainerMockChain } from '../UserList2/LogDrawer'
import { LogDrawer } from '../UserList2/LogDrawer'
import type { ExtendContainerTaskByAdmin } from './compute'
import { NOT_ASSIGN, computeList, getGroupSortIndex, isSharedGroup } from './compute'
import { ServiceCell, ServicePopOver } from './ServiceCell'
import { ServiceSearch } from './ServiceSearch'

import './index.scss'

export interface CTMListV2Props {
  data: ServiceTaskAllTasksApiResult | undefined
  refresh: () => void
  clusterDFMap: Map<string, ClusterUnit> | undefined
}

export const CTMListV2 = React.memo((props: CTMListV2Props) => {
  const [skipNotRunning, setSkipNotRunning] = useState(true)
  const [currentActiveServiceCell, setCurrentActiveServiceCell] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [currentActiveMore, setCurrentActiveMore] = useState<string | null>(null)
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false)
  const [containerInfoForLog, setContainerInfoForLog] = useState<ContainerMockChain | null>(null)

  const [foldGroups, setFoldGroups] = useState<Set<string>>(new Set())
  const [foldNodes, setFoldNodes] = useState<Set<string>>(new Set())
  const [foldAll, setFoldAll] = useState<boolean>(false)
  const [updateTime, setUpdateTime] = useState(new Date())

  const { data: allUsers } = useGroot({
    fetcher: () =>
      GlobalAilabServerClient.request(AilabServerApiName.GET_ALL_INTERNAL_EXTERNAL_USER_NAME),
    swr: true,
    auto: true,
  })

  const isExternalUser = (userName: string) => {
    if (!allUsers) return false
    return allUsers.external.includes(userName)
  }

  const globalMap = computeList(props.data, props.clusterDFMap, { skipNotRunning, searchValue })

  const updateCurrentActiveServiceCell = (taskInfo: ExtendContainerTaskByAdmin) => {
    const serviceId = `${taskInfo.id}`
    if (serviceId === currentActiveServiceCell) {
      setCurrentActiveServiceCell(null)
    } else {
      setCurrentActiveServiceCell(serviceId)
    }
  }
  const updateCurrentActiveMore = (taskInfo: ExtendContainerTaskByAdmin) => {
    const id = `${taskInfo.id}`
    if (id === currentActiveMore) {
      setCurrentActiveMore(null)
    } else {
      setCurrentActiveMore(id)
    }
  }

  const clearFold = () => {
    setFoldGroups(new Set())
    setFoldNodes(new Set())
    setFoldAll(false)
  }

  const toggleFoldAll = () => {
    if (foldAll) {
      setFoldAll(false)
      setFoldGroups(new Set())
      setFoldNodes(new Set())
    } else {
      setFoldAll(true)
    }
  }

  const toggleFoldGroup = (group: string) => {
    if (foldGroups.has(group)) {
      foldGroups.delete(group)
      setFoldGroups(new Set([...foldGroups]))
    } else {
      setFoldGroups(new Set([...foldGroups, group]))
    }
  }

  const toggleFoldNode = (node: string) => {
    if (foldNodes.has(node)) {
      foldNodes.delete(node)
      setFoldNodes(new Set([...foldNodes]))
    } else {
      setFoldNodes(new Set([...foldNodes, node]))
    }
  }

  const search = (value: string) => {
    clearFold()
    setSearchValue(value)
  }

  useFocusInterval(() => {
    props.refresh()
  }, 4000)

  useEffect(() => {
    setUpdateTime(new Date())
  }, [props.data])

  const taskOperationSuccessCallback = () => {
    props.refresh()
  }

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

  return (
    <>
      <Dialog
        isOpen={!!showHelpDialog}
        className="create-node-port-dialog"
        onClose={() => {
          setShowHelpDialog(false)
        }}
      >
        <p>一些使用说明：</p>
        <ul className="container-tips">
          <li>
            优先展示 GPU 容器，<b>节点</b>按照空闲由多到少排序， <b>用户任务</b>按照 Memory 和 CPU
            使用由多到少进行排序
          </li>
          <li>CPU 汇总：c 标志符合代表超卖，后面跟随超卖倍数</li>
          <li>Memory 汇总：悬浮可以查看最大可分配内存等信息</li>
          <li>
            对于推断因为内存不够导致无法分配的节点，我们以中括号表示，例如&nbsp;
            <b>
              <i>[512]</i>
            </b>
          </li>
          <li>对于独占节点，用户的 CPU 和 Memory 有下划线标识</li>
        </ul>
      </Dialog>
      <LogDrawer
        containerInfoForLog={containerInfoForLog}
        onClose={() => {
          setContainerInfoForLog(null)
        }}
      />
      <div className="container-operations">
        <ServiceSearch onSearch={search} />
        <div className="flex-1" />
        <div className="update-tip">Update: {dayjs(updateTime).format('HH:mm:ss')}</div>
        <Checkbox
          label="隐藏 stopped"
          checked={skipNotRunning}
          onChange={() => {
            setSkipNotRunning(!skipNotRunning)
          }}
        />
        <Button
          small
          outlined
          onClick={() => {
            toggleFoldAll()
          }}
          intent={foldAll ? 'primary' : 'none'}
        >
          {foldAll ? `展开全部用户` : `折叠全部用户`}
        </Button>
        <Button
          icon="help"
          minimal
          small
          title="使用指南"
          onClick={() => {
            setShowHelpDialog(true)
          }}
        />
      </div>
      <div className="global-container-wrapper">
        <div
          className="global-container"
          onClick={() => {
            setCurrentActiveServiceCell(null)
            setCurrentActiveMore(null)
          }}
        >
          <div className="global-title">
            <div className="cell-n w-140">Group</div>
            <div className="cell-n w-140">Node</div>
            <div className="cell-n w-120">User</div>
            <div className="cell-n w-140">Pod</div>
            <div className="cell-n w-80">Cpu(核)</div>
            <div className="cell-n w-120">Memory</div>
            <div className="cell-n w-180">Service</div>
            <div className="cell-n w-80">Status</div>
            <div className="cell-n w-140">Image</div>
            <div className="cell-n flex-1">Operating</div>
          </div>

          {globalMap.groups.size === 0 && (
            <div className="init-container">当前筛选条件下没有符合条件的数据</div>
          )}

          {globalMap.groups.size !== 0 &&
            [...globalMap.groups.entries()]
              .sort((a, b) => {
                const aIndex = getGroupSortIndex(a[0])
                const bIndex = getGroupSortIndex(b[0])
                return bIndex - aIndex
              })
              .map(([group, info]) => {
                return (
                  <div className="group-container" key={group}>
                    <div
                      className="group-name cell-n w-140 cursor-pointer"
                      onClick={() => {
                        toggleFoldGroup(group)
                      }}
                      title="单击展开/折叠详细信息"
                    >
                      {group}
                      {isSharedGroup(group) ? '' : '(独占)'}
                    </div>
                    <div className="group-main">
                      <div
                        className={classNames('group-meta cursor-pointer', {
                          collapse: foldGroups.has(group) || foldAll,
                        })}
                        onClick={() => {
                          toggleFoldGroup(group)
                        }}
                      >
                        <div className="cell-n w-140">{info.meta.countNodes}</div>
                        <div className="cell-n w-120 display-flex flex-center">
                          <SVGWrapper svg={CommonUserSvg} dClassName="service-common-user" />×
                          {info.meta.users.size}
                        </div>
                        <div className="cell-n w-140">{info.meta.countPods}</div>
                        <div className="cell-n overflow-visible flat column w-80">
                          <div className="cell-n-metric">
                            <PercentageBar
                              total={info.meta.countCPUTotal}
                              content={
                                <div className="num">
                                  {`${info.meta.countCPUTotal}${
                                    info.meta.countCPUUsed > info.meta.countCPUTotal
                                      ? `c, ${(
                                          info.meta.countCPUUsed / info.meta.countCPUTotal
                                        ).toFixed(1)}`
                                      : ''
                                  }`}
                                  {/* {info.meta.countCPUUsed}/{info.meta.countCPUTotal} */}
                                </div>
                              }
                              tip="CPU 超卖是正常逻辑"
                              metaList={[
                                {
                                  value: info.meta.countCPUUsed,
                                  tip: 'used',
                                  intent: 'success',
                                },
                                {
                                  value: Math.max(
                                    info.meta.countCPUTotal - info.meta.countCPUUsed,
                                    0,
                                  ),
                                  tip: 'free',
                                  intent: 'primary',
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="cell-n overflow-visible flat w-120">
                          <div className="cell-n-metric">
                            <PercentageBar
                              content={
                                <div className="num">
                                  {/* {info.meta.countMemoryUsed}/{info.meta.countMemoryTotal} */}
                                  {bytesToDisplay(
                                    info.meta.countMemoryTotal * 1024 * 1024 * 1024,
                                    1,
                                    true,
                                  )}
                                  {`, ${
                                    info.meta.countMemoryTotal === 0
                                      ? '0'
                                      : (
                                          (info.meta.countMemoryUsed / info.meta.countMemoryTotal) *
                                          100
                                        ).toFixed(1)
                                  } %`}
                                </div>
                              }
                              measure="GB"
                              metaList={[
                                {
                                  value: info.meta.countMemoryUsed,
                                  tip: 'used',
                                  intent: 'success',
                                },
                                {
                                  value: info.meta.countMemoryTotal - info.meta.countMemoryUsed,
                                  tip: 'free',
                                  intent: 'primary',
                                },
                              ]}
                              tip={
                                <p className="no-margin">
                                  剩余可分配最大单节点内存：
                                  <span className="emphasize">
                                    {info.meta.countMaxMemoryFree} GB
                                  </span>
                                </p>
                              }
                            />
                          </div>
                        </div>
                        <ServiceCell countService={info.meta.countService} />
                        <div className="flex-1" />
                        <Icon
                          icon="double-chevron-down"
                          className={classNames('group-header-icon', {
                            collapse: foldGroups.has(group) || foldAll,
                          })}
                        />
                      </div>
                      {foldGroups.has(group)
                        ? []
                        : [...info.nodes.entries()]
                            .sort((a, b) => {
                              return (
                                b[1].meta.countMemoryTotal -
                                b[1].meta.countMemoryUsed -
                                (a[1].meta.countMemoryTotal - a[1].meta.countMemoryUsed)
                              )
                            })
                            .map(([node, nodeInfo]) => {
                              return (
                                <div
                                  className={classNames('node-container', {
                                    light: node === NOT_ASSIGN,
                                  })}
                                  key={`${group}_${node}`}
                                >
                                  <div
                                    className="node-name flat cell-n w-140 cursor-pointer"
                                    onClick={() => {
                                      toggleFoldNode(node)
                                    }}
                                    title="单击展开/折叠详细信息"
                                  >
                                    {node}
                                  </div>
                                  <div
                                    className={classNames('node-main', {
                                      collapse: foldNodes.has(node) || foldAll,
                                    })}
                                  >
                                    <div
                                      className={classNames('node-meta cursor-pointer', {
                                        collapse: foldNodes.has(node) || foldAll,
                                      })}
                                      onClick={() => {
                                        toggleFoldNode(node)
                                      }}
                                    >
                                      <div className="cell-n flat w-120 display-flex flex-center">
                                        {nodeInfo.meta.users.size === 1 && !isSharedGroup(group) ? (
                                          <>
                                            <SVGWrapper
                                              svg={CommonUserSvg}
                                              dClassName="service-common-user"
                                            />
                                            &nbsp;{`${[...nodeInfo.meta.users!][0]}`}
                                          </>
                                        ) : (
                                          <>
                                            <SVGWrapper
                                              svg={CommonUserSvg}
                                              dClassName="service-common-user"
                                            />
                                            ×{nodeInfo.meta.users.size}
                                          </>
                                        )}
                                      </div>
                                      <div className="cell-n flat w-140">
                                        {nodeInfo.meta.countPods}
                                      </div>
                                      <div className="cell-n overflow-visible flat column w-80">
                                        <div className="cell-n-metric">
                                          <PercentageBar
                                            tip="CPU超卖是正常逻辑"
                                            total={nodeInfo.meta.countCPUTotal}
                                            content={
                                              <div className="num">
                                                {/* {nodeInfo.meta.countCPUUsed}/
                                                {nodeInfo.meta.countCPUTotal} */}
                                                {`${nodeInfo.meta.countCPUTotal}${
                                                  nodeInfo.meta.countCPUUsed >
                                                  nodeInfo.meta.countCPUTotal
                                                    ? `c, ${(
                                                        nodeInfo.meta.countCPUUsed /
                                                        nodeInfo.meta.countCPUTotal
                                                      ).toFixed(1)}`
                                                    : ''
                                                }`}
                                              </div>
                                            }
                                            metaList={[
                                              {
                                                value: nodeInfo.meta.countCPUUsed,
                                                tip: 'used',
                                                intent: 'success',
                                              },
                                              {
                                                value: Math.max(
                                                  nodeInfo.meta.countCPUTotal -
                                                    nodeInfo.meta.countCPUUsed,
                                                  0,
                                                ),
                                                tip: 'free',
                                                intent: 'primary',
                                              },
                                            ]}
                                          />
                                        </div>
                                      </div>
                                      <div className="cell-n overflow-visible flat w-120">
                                        <div className="cell-n-metric">
                                          <PercentageBar
                                            content={
                                              <div className="num">
                                                {/* {nodeInfo.meta.countMemoryUsed}/
                                                {nodeInfo.meta.countMemoryTotal} */}
                                                {bytesToDisplay(
                                                  nodeInfo.meta.countMemoryTotal *
                                                    1024 *
                                                    1024 *
                                                    1024,
                                                  1,
                                                  true,
                                                )}
                                                {`, ${
                                                  nodeInfo.meta.countMemoryTotal === 0
                                                    ? '0'
                                                    : (
                                                        (nodeInfo.meta.countMemoryUsed /
                                                          nodeInfo.meta.countMemoryTotal) *
                                                        100
                                                      ).toFixed(1)
                                                } %`}
                                              </div>
                                            }
                                            measure="GB"
                                            metaList={[
                                              {
                                                value: nodeInfo.meta.countMemoryUsed,
                                                tip: 'used',
                                                intent: 'success',
                                              },
                                              {
                                                value:
                                                  nodeInfo.meta.countMemoryTotal -
                                                  nodeInfo.meta.countMemoryUsed,
                                                tip: 'free',
                                                intent: 'primary',
                                              },
                                            ]}
                                          />
                                        </div>
                                      </div>
                                      <ServiceCell
                                        className="flat"
                                        countService={nodeInfo.meta.countService}
                                      />
                                      <div className="flex-1" />
                                      <Icon
                                        icon="double-chevron-down"
                                        className={classNames('group-header-icon', {
                                          collapse: foldNodes.has(node) || foldAll,
                                        })}
                                      />
                                    </div>
                                    {foldNodes.has(node) || foldAll
                                      ? []
                                      : [...nodeInfo.users.entries()]
                                          .sort((a, b) => {
                                            let diff =
                                              (a[1].meta.countMemoryUsed || 0) -
                                              (b[1].meta.countMemoryUsed || 0)
                                            if (diff === 0)
                                              diff =
                                                (a[1].meta.countCPUUsed || 0) -
                                                (b[1].meta.countCPUUsed || 0)
                                            return -diff
                                          })
                                          .map(([user, userInfo]) => {
                                            return (
                                              <div
                                                className="user-container"
                                                key={`${group}_${node}_${user}`}
                                              >
                                                {/* <div className="user-name cell-n w-140">{user}</div> */}
                                                <div className="user-main">
                                                  {[...userInfo.tasks.entries()].map(
                                                    ([, taskInfo]) => {
                                                      const outOfAllocate =
                                                        ((taskInfo.status === 'queued' &&
                                                          taskInfo.config_json.schema.resource
                                                            .memory) ||
                                                          0) > info.meta.countMaxMemoryFree
                                                      return (
                                                        <div className="task-li" key={taskInfo.id}>
                                                          <div
                                                            className="cell-n w-120 cursor-pointer"
                                                            title="点击用户名以搜索该用户"
                                                            onClick={() => {
                                                              setSearchValue(taskInfo.user_name)
                                                              hfEventEmitter.emit(
                                                                WebEventsKeys.containerAdminSearchChange,
                                                                taskInfo.user_name,
                                                              )
                                                            }}
                                                          >
                                                            {isExternalUser(taskInfo.user_name)
                                                              ? '*'
                                                              : ''}
                                                            {taskInfo.user_name}
                                                          </div>
                                                          <div
                                                            className="cell-n w-140"
                                                            title={`created_at: ${taskInfo.created_at}`}
                                                          >
                                                            {!!taskInfo.config_json.schema.resource
                                                              .is_spot && `[Spot]`}
                                                            {taskInfo.nb_name}
                                                          </div>
                                                          <div
                                                            title={`${
                                                              isSharedGroup(group)
                                                                ? ''
                                                                : '[独占节点]'
                                                            }`}
                                                            className="cell-n w-80"
                                                            style={{
                                                              textDecoration: isSharedGroup(group)
                                                                ? ''
                                                                : 'underline',
                                                            }}
                                                          >
                                                            {taskInfo.config_json.schema.resource
                                                              .cpu || '--'}
                                                          </div>
                                                          <div
                                                            className={classNames('cell-n w-120', {
                                                              out_of_allocate: outOfAllocate,
                                                            })}
                                                            title={`${
                                                              isSharedGroup(group)
                                                                ? ''
                                                                : '[独占节点]'
                                                            }${
                                                              outOfAllocate
                                                                ? '超过当前可分配的最大内存'
                                                                : ''
                                                            }`}
                                                            style={{
                                                              textDecoration: isSharedGroup(group)
                                                                ? ''
                                                                : 'underline',
                                                            }}
                                                          >
                                                            {outOfAllocate
                                                              ? `[${
                                                                  taskInfo.config_json.schema
                                                                    .resource.memory + ' G' || '--'
                                                                }]`
                                                              : taskInfo.config_json.schema.resource
                                                                  .memory + ' G' || '--'}
                                                          </div>
                                                          <ServiceCell
                                                            clickable
                                                            countService={taskInfo.countService}
                                                            onClick={() => {
                                                              updateCurrentActiveServiceCell(
                                                                taskInfo,
                                                              )
                                                            }}
                                                            popOverNode={
                                                              currentActiveServiceCell ===
                                                              `${taskInfo.id}` ? (
                                                                <div className="service-cell-pop-over">
                                                                  <ServicePopOver
                                                                    taskInfo={taskInfo}
                                                                    showServiceLog={(
                                                                      serviceName,
                                                                    ) => {
                                                                      showContainerOrServiceLog(
                                                                        taskInfo,
                                                                        serviceName,
                                                                      )
                                                                    }}
                                                                  />
                                                                </div>
                                                              ) : null
                                                            }
                                                          />
                                                          <div className="cell-n w-80">
                                                            <ContainerStatus
                                                              status={taskInfo.status}
                                                            />
                                                          </div>
                                                          <div className="cell-n w-140">
                                                            {taskInfo.backend}
                                                          </div>
                                                          <div className="cell-n flex-1 operation-btns">
                                                            {[
                                                              ContainerTaskStatus.STOPPED,
                                                              ContainerTaskStatus.FINISHED,
                                                            ].includes(taskInfo.status) ? (
                                                              <>
                                                                <button
                                                                  className="jupyter-op hfp-btn danger"
                                                                  onClick={() => {
                                                                    TaskOperation.deleteTask(
                                                                      taskInfo,
                                                                      taskOperationSuccessCallback,
                                                                    )
                                                                  }}
                                                                >
                                                                  {i18n.t(i18nKeys.base_delete)}
                                                                </button>
                                                                <button
                                                                  className="jupyter-op hfp-btn  primary"
                                                                  onClick={() => {
                                                                    TaskOperation.start(
                                                                      taskInfo,
                                                                      taskInfo.token,
                                                                      taskInfo.user_name,
                                                                      taskOperationSuccessCallback,
                                                                    )
                                                                  }}
                                                                >
                                                                  {i18n.t(i18nKeys.base_start)}
                                                                </button>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <button
                                                                  className="jupyter-op hfp-btn primary"
                                                                  onClick={() => {
                                                                    TaskOperation.restartTask(
                                                                      taskInfo,
                                                                      taskOperationSuccessCallback,
                                                                    )
                                                                  }}
                                                                >
                                                                  重启
                                                                </button>
                                                                <button
                                                                  className="jupyter-op hfp-btn danger"
                                                                  onClick={() => {
                                                                    TaskOperation.stop(
                                                                      taskInfo,
                                                                      taskOperationSuccessCallback,
                                                                    )
                                                                  }}
                                                                >
                                                                  停止
                                                                </button>
                                                              </>
                                                            )}
                                                            <div className="jupyter-op-more">
                                                              <button
                                                                className="jupyter-op hfp-btn none"
                                                                onClick={(e) => {
                                                                  e.stopPropagation()
                                                                  e.preventDefault()
                                                                  updateCurrentActiveMore(taskInfo)
                                                                }}
                                                              >
                                                                •••
                                                              </button>
                                                              <div
                                                                className={classNames(
                                                                  'service-cell-pop-over',
                                                                  'more-btns',
                                                                  {
                                                                    hide:
                                                                      currentActiveMore !==
                                                                      `${taskInfo.id}`,
                                                                  },
                                                                )}
                                                              >
                                                                <div className="cell-pop-over-main ops">
                                                                  <button
                                                                    className="jupyter-op hfp-btn warn"
                                                                    onClick={() => {
                                                                      showContainerOrServiceLog(
                                                                        taskInfo,
                                                                      )
                                                                    }}
                                                                  >
                                                                    {i18n.t(
                                                                      i18nKeys.biz_container_log_for_container,
                                                                    )}
                                                                  </button>
                                                                  <button
                                                                    className="jupyter-op hfp-btn none"
                                                                    onClick={() => {
                                                                      window.open(
                                                                        `${getCurrentAdminURL(
                                                                          (
                                                                            taskInfo as ContainerTaskByAdmin
                                                                          ).token,
                                                                          taskInfo.user_name,
                                                                        )}#/manage`,
                                                                      )
                                                                    }}
                                                                  >
                                                                    进入 Studio
                                                                  </button>
                                                                  {}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )
                                                    },
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          })}
                                  </div>
                                </div>
                              )
                            })}
                    </div>
                  </div>
                )
              })}
        </div>
      </div>
    </>
  )
})

export interface CTMListV2ContainerProps {
  data: ServiceTaskAllTasksApiResult | undefined
  refresh: () => void
  clusterDFMap: Map<string, ClusterUnit> | undefined
  status: GrootStatus
}

export const CTMListV2Container = React.memo((props: CTMListV2ContainerProps) => {
  const refreshRef = useRef(props.refresh)
  const [contentFirstLoaded, setContentFirstLoaded] = useState(false)

  useEffect(() => {
    if (props.status === GrootStatus.success) setContentFirstLoaded(true)
  }, [props.status])

  useEffect(() => {
    refreshRef.current = props.refresh
  }, [props.refresh])

  const refreshWithRef = useCallback(() => {
    refreshRef.current()
  }, [])

  return (
    <div className="container-manager-wrapper">
      {!contentFirstLoaded && <div className="init-container">内容获取中，请稍后...</div>}

      {props.status === GrootStatus.error && (
        <div className="init-container">获取内容出现错误，请联系管理员调查</div>
      )}

      {contentFirstLoaded && props.status !== GrootStatus.error && (
        <CTMListV2 refresh={refreshWithRef} data={props.data} clusterDFMap={props.clusterDFMap} />
      )}
    </div>
  )
})
