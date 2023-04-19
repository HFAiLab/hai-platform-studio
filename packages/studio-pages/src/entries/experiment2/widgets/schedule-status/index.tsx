/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { CurrentTasksInfo, TaskPriority } from '@hai-platform/shared'
import { TaskChainStatus, TaskPriorityName } from '@hai-platform/shared'
import { Button } from '@hai-ui/core'
import React, { useContext, useEffect, useRef } from 'react'
import { useRefState } from '../../../../hooks/useRefState'
import type { Chain } from '../../../../model/Chain'
import { PriorityIcon } from '../../../../ui-components/svgIcon'
import { ExpServiceContext } from '../../reducer'

interface CurrentScheduleInfo {
  sortIndex: number
  customRankList: number[]
  priority: TaskPriority | undefined
}

const ScheduleUpdateInterval = 6000

export const ExpScheduleStatus = () => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const { chain } = state
  const intervalIndexRef = useRef<number | null>(null)

  const [currentScheduleInfo, currentScheduleInfoRef, setCurrentScheduleInfo] =
    useRefState<CurrentScheduleInfo | null>(null)

  const handleCurrentTaskInfo = (currentTaskInfo: CurrentTasksInfo, currentChain: Chain) => {
    const taskRankMap: Record<string, number[]> = {}
    let nextSortIndex: number | null = null
    let priorityForCurrentTask: number | null = null

    // 把实验排成一串：
    const allTopTasks = (currentTaskInfo.topTasks.userTopTaskList.scheduled || []).concat(
      currentTaskInfo.topTasks.userTopTaskList.queued || [],
    )
    allTopTasks.sort((Y, H) => Y.custom_rank - H.custom_rank)

    for (const task of allTopTasks) {
      const taskPriority = window._hf_user_if_in ? task.priority : TaskPriorityName.AUTO
      if (!taskRankMap[taskPriority]) taskRankMap[taskPriority] = []
      if (task.chain_id === currentChain.chain_id) {
        nextSortIndex = taskRankMap[taskPriority]!.length
        priorityForCurrentTask = task.priority
      }

      taskRankMap[taskPriority]!.push(task.custom_rank)
    }

    if (nextSortIndex !== null && priorityForCurrentTask !== null) {
      setCurrentScheduleInfo({
        sortIndex: nextSortIndex,
        customRankList:
          taskRankMap[window._hf_user_if_in ? priorityForCurrentTask : TaskPriorityName.AUTO] || [],
        priority: window._hf_user_if_in ? priorityForCurrentTask : undefined,
      })
    } else {
      setCurrentScheduleInfo(null)
    }
  }

  const updateFromRemote = (currentChain: Chain, force = false) => {
    return srvc.app
      .api()
      .getAilabServerClient()
      .request(AilabServerApiName.TRAININGS_CURRENT_TASK_INFO, {
        force,
      })
      .then((res) => {
        handleCurrentTaskInfo(res, currentChain)
      })
  }

  useEffect(() => {
    if (!chain) {
      setCurrentScheduleInfo(null)
      return
    }

    if (chain.chain_status === TaskChainStatus.FINISHED) {
      setCurrentScheduleInfo(null)
      return
    }

    // 针对正在运行的任务展示一下
    intervalIndexRef.current = window.setInterval(() => {
      if (!document.hasFocus()) return
      updateFromRemote(chain)
    }, ScheduleUpdateInterval)

    updateFromRemote(chain)

    // eslint-disable-next-line consistent-return
    return () => {
      if (intervalIndexRef.current) {
        clearInterval(intervalIndexRef.current)
        intervalIndexRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.chain_status])

  const moveToFirst = async () => {
    if (
      !currentScheduleInfoRef.current ||
      !currentScheduleInfoRef.current.customRankList[0] ||
      !chain
    ) {
      srvc.app
        .api()
        .getHFUIToaster()
        .show({
          message: i18n.t(i18nKeys.biz_exp_schedule_unavailable),
          intent: 'warning',
        })
      return
    }

    await srvc.app
      .api()
      .getApiServerClient()
      .request(ApiServerApiName.UPDATE_PRIORITY_API, {
        priority: currentScheduleInfoRef.current.priority,
        custom_rank: currentScheduleInfoRef.current.customRankList[0] - 0.5,
        chain_id: chain.chain_id,
      })
    // 如果出错了，自会抛异常和弹出提示，不会走到下面了

    srvc.app
      .api()
      .getHFUIToaster()
      .show({
        message: i18n.t(i18nKeys.biz_exp_schedule_succ),
        intent: 'success',
      })

    // 这两个只是为了增强体验，请求不到新的也没啥关系其实
    setTimeout(() => {
      updateFromRemote(chain, true)
    }, 1000)
    setTimeout(() => {
      updateFromRemote(chain, true)
    }, 5000)
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {currentScheduleInfo && (
        <div className="exp2-schedule-status-container">
          <div className="exp2-schedule-status-header">
            {window._hf_user_if_in && currentScheduleInfo.priority && (
              <div>
                <PriorityIcon priority={currentScheduleInfo.priority} marginRight={6} />
              </div>
            )}
            <div className="header-title">{i18n.t(i18nKeys.biz_exp_schedule_status)}</div>
          </div>
          <div className="exp2-schedule-status-content">
            {currentScheduleInfo && (
              <div
                className="schedule-rank"
                title="在当前优先级的个人任务队列中排序，越靠前则相对被调度运行的概率越大"
              >
                {i18n.t(i18nKeys.biz_exp_schedule_order)}&nbsp;
                {currentScheduleInfo.sortIndex + 1}/{currentScheduleInfo.customRankList.length}
              </div>
            )}
            <div className="schedule-op">
              <Button
                small
                outlined
                onClick={moveToFirst}
                disabled={currentScheduleInfo.sortIndex === 0}
                title="将任务移动到当前优先级队列的队头，从而获得更大概率的调度机会"
              >
                {i18n.t(i18nKeys.biz_exp_schedule_move_to_first)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
