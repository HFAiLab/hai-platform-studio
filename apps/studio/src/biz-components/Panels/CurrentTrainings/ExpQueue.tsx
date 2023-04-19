/* eslint-disable no-underscore-dangle */
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { TaskPriorityNameStandard, UserTopTask } from '@hai-platform/shared'
import {
  TaskPriorityName,
  TaskQueueStatus,
  isCPUGroup,
  priorityToName,
  priorityToNumber,
} from '@hai-platform/shared'
import { PriorityIcon, StatusIconV2 } from '@hai-platform/studio-pages/lib/ui-components/svgIcon'
import { SVGWrapper } from '@hai-platform/studio-pages/lib/ui-components/svgWrapper'
import { LevelLogger } from '@hai-platform/studio-toolkit/lib/esm'
import { secondsToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import { Button } from '@hai-ui/core/lib/esm/components/button/buttons'
import { Callout } from '@hai-ui/core/lib/esm/components/callout/callout'
import { Dialog } from '@hai-ui/core/lib/esm/components/dialog/dialog'
import { Icon } from '@hai-ui/core/lib/esm/components/icon/icon'
import { PopoverPosition } from '@hai-ui/core/lib/esm/components/popover/popoverSharedProps'
import { Tooltip2 } from '@hai-ui/popover2'
import classNames from 'classnames'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { UpdatePriorityResponse } from '../../../api/serverConnection'
import type { RendererProps, ToMovedInfo } from '../../../components/DragQueue/index'
import { DragQueue } from '../../../components/DragQueue/index'
import ClusterNodesSvg from '../../../components/svg/cluster-nodes.svg?raw'
import NodeCPUSvg from '../../../components/svg/node-cpu.svg?raw'
import NodeDGXSvg from '../../../components/svg/node-dgx.svg?raw'
import { AppToaster } from '../../../utils'
import { isFirefox } from '../../../utils/browser'
import { AilabCountly, CountlyEventKey } from '../../../utils/countly'

export type QueueItemList = {
  [key in TaskPriorityNameStandard]?: UserTopTask[]
}

export interface TaskOperation {
  op: 'update_priority_and_rank'
  chain_id: string
  priority: number
  custom_rank: number
}

export interface ExpQueueTaskInfo {
  seq: number
  items: QueueItemList
}

interface ExpQueueProps {
  taskInfo: ExpQueueTaskInfo
  operationCallback: (ops: TaskOperation | null) => Promise<UpdatePriorityResponse>
  invokeRefresh: () => Promise<unknown>
}

export const ExpQueueTitle = React.memo(() => {
  const [helperIsOpen, setHelperIsOpen] = useState(false)

  return (
    <div>
      <Dialog
        title={i18n.t(i18nKeys.biz_exp_queue_drag_note_title)}
        isOpen={!!helperIsOpen}
        onClose={() => {
          setHelperIsOpen(false)
        }}
      >
        <div className="queue-helper-dialog">
          <Callout className="current-training-callout" intent="primary">
            {i18n.t(
              window._hf_user_if_in
                ? i18nKeys.biz_exp_queue_drag_note_callout
                : i18nKeys.biz_exp_queue_drag_note_callout_external,
            )}
          </Callout>
          {window._hf_user_if_in && (
            <p className="queue-helper-title">{i18n.t(i18nKeys.biz_exp_queue_drag_note)}</p>
          )}
          <ul className="queue-helper-ul">
            {window._hf_user_if_in && (
              <li>{i18n.t(i18nKeys.biz_exp_queue_drag_note_not_same_level)}</li>
            )}
            {window._hf_user_if_in && (
              <li>{i18n.t(i18nKeys.biz_exp_queue_drag_note_same_level)}</li>
            )}
            {!window._hf_user_if_in && <li>{i18n.t(i18nKeys.biz_exp_queue_drag_note_external)}</li>}
          </ul>
          <Button
            className="queue-get-it"
            intent="primary"
            onClick={() => {
              setHelperIsOpen(false)
            }}
          >
            {i18n.t(i18nKeys.biz_got_it)}
          </Button>
        </div>
      </Dialog>
      <div className="task-queue-title">
        <span className="desc">
          {i18n.t(i18nKeys.biz_exp_queue_desc)}
          <Tooltip2
            className="desc-help-container"
            position={PopoverPosition.TOP}
            content={i18n.t(i18nKeys.biz_exp_queue_click_show_help)}
          >
            <Icon
              style={{ verticalAlign: 'top' }}
              icon="help"
              onClick={() => {
                setHelperIsOpen(true)
              }}
            />
          </Tooltip2>
        </span>
        <Link to="/manage" className="more">
          {`${i18n.t(i18nKeys.biz_current_trainings_more_to_manager)} >`}
        </Link>
      </div>
    </div>
  )
})

export const ExpQueue = (props: ExpQueueProps) => {
  const [computedItems, setComputedItems] = useState(props.taskInfo.items)
  const [operating, setOperating] = useState(false)
  // currentSeq 不存在的话就说明用户还没有拖动过
  const [currentSeq, setCurrentSeq] = useState<number | null>(null)

  useEffect(() => {
    if (operating) return
    if (!currentSeq || props.taskInfo.seq > currentSeq) {
      setComputedItems(props.taskInfo.items)
      // console.log('[QUEUE LOG] use remote items', props.taskInfo.items)
    }
  }, [props.taskInfo, operating, currentSeq])

  const priorityList = window._hf_user_if_in
    ? ([
        TaskPriorityName.EXTREME_HIGH,
        TaskPriorityName.VERY_HIGH,
        TaskPriorityName.HIGH,
        TaskPriorityName.ABOVE_NORMAL,
      ] as TaskPriorityNameStandard[])
    : ([TaskPriorityName.AUTO] as TaskPriorityNameStandard[])

  const getItemId = (item: UserTopTask): string => {
    return `item-${item.chain_id}`
  }

  const getListId = (priorityStr: string) => {
    return `list-${priorityStr}`
  }

  useLayoutEffect(() => {
    const listContainers = [
      ...document.getElementsByClassName('exp-drag-list-container'),
    ] as HTMLDivElement[]
    const destroyCallbacks: (() => void)[] = []
    for (const listContainerDom of listContainers) {
      const listDom = listContainerDom.children[0] as HTMLDivElement
      const scrollCallback = (event: Event): void => {
        const b =
          (event as unknown as { wheelDelta: number }).wheelDelta || -(event as WheelEvent).deltaY
        const distance = isFirefox ? -b * 2 : -b / 2
        listContainerDom.scrollLeft += distance
        event.preventDefault()
      }
      if (listDom && listContainerDom.offsetWidth < listDom.offsetWidth) {
        if (isFirefox) {
          listContainerDom.addEventListener('wheel', scrollCallback)
        } else {
          listContainerDom.addEventListener('mousewheel', scrollCallback)
        }
        destroyCallbacks.push(() => {
          if (isFirefox) {
            listContainerDom.removeEventListener('wheel', scrollCallback)
          } else {
            listContainerDom.removeEventListener('mousewheel', scrollCallback)
          }
        })
      }
    }
    return () => {
      destroyCallbacks.map((v) => v())
    }
  })

  const renderer = (renderProps: RendererProps<UserTopTask>): JSX.Element => {
    return (
      <div className="task-queue">
        <ExpQueueTitle />
        {renderProps.inEditLoading && <div className="edit-loading" />}

        {priorityList.map((p) => {
          const itemList = computedItems[p] || []
          return (
            <div
              className={classNames('q-container', p, {
                empty: itemList.length === 0,
              })}
            >
              <div className="q-title">
                <PriorityIcon priority={p} />
              </div>
              <div className="exp-drag-list-container">
                <div className="exp-drag-list" id={getListId(p)}>
                  {itemList.length === 0 && !operating && (
                    <p className="exp-drag-empty-tip">
                      {window._hf_user_if_in
                        ? i18n.t(i18nKeys.biz_exp_queue_no_task_inner)
                        : i18n.t(i18nKeys.biz_exp_queue_no_task)}
                    </p>
                  )}
                  {itemList.length === 0 &&
                    renderProps.toMovedItem &&
                    getListId(p) === renderProps.toMovedItem.listId &&
                    renderProps.toMovedItem.itemId === 'begin' && (
                      <div
                        className={classNames('exp-drag-item move-target', {
                          'in-empty-list': itemList.length === 0,
                        })}
                      />
                    )}
                  {itemList.map((item: UserTopTask, index: number) => {
                    if (
                      renderProps.movingItem &&
                      renderProps.movingItem.chain_id === item.chain_id
                    ) {
                      return <div className="exp-drag-item move-skip" />
                    }

                    const chainTitle =
                      `${i18n.t(i18nKeys.biz_exp_status_task_name).padEnd(16, ' ')}: ${
                        item.nb_name
                      }\n` +
                      `${
                        item.queue_status === TaskQueueStatus.QUEUED
                          ? i18n.t(i18nKeys.biz_current_train_already_wait).padEnd(16, ' ')
                          : i18n.t(i18nKeys.biz_current_train_already_run).padEnd(16, ' ')
                      }: ${
                        item.queue_status === TaskQueueStatus.QUEUED
                          ? secondsToDisplay(item.created_seconds)
                          : secondsToDisplay(item.running_seconds)
                      }`

                    const nodesTitle = `${i18n.t(i18nKeys.biz_exp_status_task_nodes)}: ${
                      item.nodes
                    }`

                    const moveToFirst = () => {
                      renderProps.handleMovedInfo(item, {
                        next: itemList[0]!,
                        pre: null,
                        targetIndex: 0,
                        listId: getListId(p),
                        itemId: getItemId(item),
                      })
                    }

                    const currentItem = (
                      <div className="exp-drag-item" id={getItemId(item)}>
                        <p className="q-status-bar">
                          <StatusIconV2
                            chainStatus={item.chain_status}
                            workerStatus={item.worker_status}
                          />
                        </p>

                        <p className="chain-name" title={chainTitle}>
                          {item.nb_name}
                        </p>

                        <p className="chain-nodes">
                          <div className="chain-nodes-inner-content">
                            <div className="chain-nodes-tip-and-icon">
                              <div title={nodesTitle} className="chain-nodes-icon-number">
                                <SVGWrapper svg={ClusterNodesSvg} dClassName="q-nodes" />
                                <span className="chain-nodes-number">{item.nodes}</span>
                              </div>
                              {}
                              {isCPUGroup(item.group || '') && (
                                <SVGWrapper svg={NodeCPUSvg} dClassName="q-node-type" />
                              )}
                              <span className="chain-nodes-expand" />

                              {index !== 0 && (
                                <span
                                  title={i18n.t(i18nKeys.biz_current_train_move_to_head)}
                                  className="quick-icon-container"
                                >
                                  <Icon
                                    icon="bring-data"
                                    className="quick-icon"
                                    onClick={moveToFirst}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </p>
                        <div
                          className="move-handler"
                          id={`handler-${item.chain_id}`}
                          onMouseDown={() => {
                            AilabCountly.safeReport(CountlyEventKey.dragQueueBeginDrag)
                            renderProps.mouseDownCallback(item, {
                              setOperating,
                            })
                          }}
                        >
                          <Icon icon="drag-handle-vertical" />
                        </div>
                      </div>
                    )

                    if (!renderProps.toMovedItem || getListId(p) !== renderProps.toMovedItem.listId)
                      return currentItem

                    if (renderProps.toMovedItem.itemId === 'begin' && index === 0) {
                      return (
                        <>
                          <div className="exp-drag-item move-target" />
                          {currentItem}
                        </>
                      )
                    }
                    if (renderProps.toMovedItem.itemId === 'end' && index === itemList.length - 1) {
                      return (
                        <>
                          {currentItem}
                          <div className="exp-drag-item move-target" />
                        </>
                      )
                    }

                    if (renderProps.toMovedItem.itemId === getItemId(item)) {
                      return (
                        <>
                          {currentItem}
                          <div className="exp-drag-item move-target" />
                        </>
                      )
                    }
                    return currentItem
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const getOperations = useCallback(
    (
      currMovingItem: UserTopTask | null,
      currToMovedInfo: ToMovedInfo<UserTopTask> | null,
    ): TaskOperation | null => {
      if (!currMovingItem || !currToMovedInfo) return null
      const targetPriorityValue = priorityToNumber(currToMovedInfo.listId.replace('list-', ''))
      let { priority } = currMovingItem
      let customRank = currMovingItem.custom_rank

      if (currMovingItem.priority !== targetPriorityValue) {
        priority = targetPriorityValue
      }

      if (!window._hf_user_if_in) priority = -1

      if (!currToMovedInfo.pre && !currToMovedInfo.next) {
        // do nothing
      } else if (currToMovedInfo.pre && currToMovedInfo.next) {
        customRank = (currToMovedInfo.pre.custom_rank + currToMovedInfo.next.custom_rank) / 2
      } else if (currToMovedInfo.pre) {
        customRank = currToMovedInfo.pre.custom_rank + 0.5
      } else {
        customRank = currToMovedInfo.next!.custom_rank - 0.5
      }

      if (currMovingItem.priority === priority && currMovingItem.custom_rank === customRank) {
        return null
      }

      return {
        op: 'update_priority_and_rank',
        chain_id: currMovingItem.chain_id,
        priority: window._hf_user_if_in ? priority : -1,
        custom_rank: customRank,
      }
    },
    [],
  )

  const invokeRefreshLater = (time: number): void => {
    setTimeout(() => {
      props.invokeRefresh()
    }, time)
  }

  return (
    <DragQueue
      renderer={renderer}
      occupyWidthOrHeight={90}
      direction="horizontal"
      listClassName="exp-drag-list"
      itemClassName="exp-drag-item"
      getItems={(m) => {
        const p = m.replace('list-', '') as unknown as TaskPriorityNameStandard
        return computedItems[p] || []
      }}
      getItemId={getItemId}
      errorCallback={(m) => {
        LevelLogger.error(`[QUEUE LOG] DraggableQueue return error: ${m.message}`)
        AppToaster.show({ message: m.message, intent: 'danger' })
      }}
      handleMovedInfo={(
        currMovingItem: UserTopTask | null,
        currToMovedInfo: ToMovedInfo<UserTopTask> | null,
      ) => {
        if (!currMovingItem || !currToMovedInfo) {
          return Promise.resolve()
        }
        const operation = getOperations(currMovingItem, currToMovedInfo)
        return new Promise((rs) => {
          props.operationCallback(operation).then((res) => {
            if (!res.success) {
              AppToaster.show({ message: res.msg, intent: 'danger' })
              rs()
            } else if (operation) {
              AppToaster.show({
                message: i18n.t(i18nKeys.biz_exp_queue_drag_success_tip),
                intent: 'success',
              })

              const currentPriority = (window._hf_user_if_in
                ? priorityToName(currMovingItem.priority)
                : TaskPriorityName.AUTO) as unknown as TaskPriorityNameStandard
              const deepCloneItems = JSON.parse(JSON.stringify(computedItems)) as QueueItemList
              const targetPriority = currToMovedInfo.listId.replace(
                'list-',
                '',
              ) as unknown as TaskPriorityNameStandard

              if (deepCloneItems[currentPriority]) {
                const itemIndex = deepCloneItems[currentPriority]!.findIndex(
                  (item) => item.chain_id === currMovingItem.chain_id,
                )
                if (targetPriority === currentPriority && currToMovedInfo.targetIndex > itemIndex) {
                  currToMovedInfo.targetIndex -= 1
                }
                deepCloneItems[currentPriority]!.splice(itemIndex, 1)
              } else {
                LevelLogger.warn('[QUEUE LOG] before submit: computedItemsClone[pStr] is null')
              }

              const targetItem = { ...currMovingItem }
              targetItem.priority = operation.priority
              targetItem.custom_rank = operation.custom_rank
              if (deepCloneItems[targetPriority] && deepCloneItems[targetPriority]!.length) {
                deepCloneItems[targetPriority]!.splice(currToMovedInfo.targetIndex, 0, targetItem)
              } else {
                deepCloneItems[targetPriority] = [targetItem]
              }

              // console.log('[QUEUE LOG] deepCloneItems', deepCloneItems)
              setComputedItems(deepCloneItems)
              setCurrentSeq(res.timestamp * 1000)
              invokeRefreshLater(1000)
              invokeRefreshLater(2000)
              invokeRefreshLater(3000)
              invokeRefreshLater(4000)
              rs()
            } else {
              rs()
            }
          })
        })
      }}
      enableDragScroll
    />
  )
}
