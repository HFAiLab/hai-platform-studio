/* eslint-disable no-underscore-dangle */
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { IQuotaMap, TaskPriorityNameStandard, UserTaskMap } from '@hai-platform/shared'
import { TaskPriorityName, getDefaultTrainingGroup, priorityToName } from '@hai-platform/shared'
import { PriorityIcon } from '@hai-platform/studio-pages/lib/ui-components/svgIcon'
import { Callout } from '@hai-ui/core'
import { Tooltip2 } from '@hai-ui/popover2/lib/esm/tooltip2'
import React, { useContext, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { GlobalApiServerClient } from '../../../api/apiServer'
import type { UpdatePriorityResponse } from '../../../api/serverConnection'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { DefaultMetricStyle, MetricItem } from '../../../components/MetricItem'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { User } from '../../../modules/user'
import { LevelLogger } from '../../../utils'
import { AilabCountly, CountlyEventKey } from '../../../utils/countly'
import { computeQuotaList } from '../../../utils/quota'
import type { ExpQueueTaskInfo, QueueItemList, TaskOperation } from './ExpQueue'
import { ExpQueue } from './ExpQueue'

import './index.scss'

export const CurrentTrainings = (): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  const [userTaskMap, setUserTaskMap] = useState<UserTaskMap | null>(null)

  const [userMixTopTasks, setUserMixTopTasks] = useState<ExpQueueTaskInfo>({
    seq: 0,
    items: {},
  })

  const [quotaGroup, setQuotaGroup] = useState<string>(getDefaultTrainingGroup())
  const [quotaMap, setQuotaMap] = useState<IQuotaMap>({})

  const fetchCurrentTasksInfo = (force = false): Promise<void> => {
    return GlobalAilabServerClient.request(AilabServerApiName.TRAININGS_CURRENT_TASK_INFO, {
      force,
    }).then((res) => {
      if (!res) {
        LevelLogger.error('getCurrentTasksInfo but get empty')
        return
      }
      setUserTaskMap(res.overview)

      const allTopTasks = (res.topTasks.userTopTaskList.scheduled || []).concat(
        res.topTasks.userTopTaskList.queued || [],
      )
      allTopTasks.sort((Y, H) => Y.custom_rank - H.custom_rank)

      const mixTopTasks: QueueItemList = {
        [TaskPriorityName.EXTREME_HIGH]: [],
        [TaskPriorityName.VERY_HIGH]: [],
        [TaskPriorityName.HIGH]: [],
        [TaskPriorityName.ABOVE_NORMAL]: [],
        [TaskPriorityName.AUTO]: [],
      }

      for (const topTask of allTopTasks) {
        // eslint-disable-next-line no-underscore-dangle
        if (!window._hf_user_if_in) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          mixTopTasks[TaskPriorityName.AUTO]!.push(topTask)
          continue
        }
        const pStr = priorityToName(topTask.priority)
        if (pStr in mixTopTasks) {
          mixTopTasks[pStr as TaskPriorityNameStandard]!.push(topTask)
        } else {
          LevelLogger.warn(`pStr ${pStr} not expected`)
        }
      }

      setUserMixTopTasks({
        seq: res.topTasks.seq,
        items: mixTopTasks,
      })
    })
  }

  const fetchQuotaInfo = (): Promise<void> => {
    return User.getInstance()
      .fetchQuotaInfo()
      .then((nextQuotaMap) => {
        setQuotaMap(nextQuotaMap)
      })
  }

  const fetchData = (silent?: boolean): void => {
    if (panelCTX.loadingStatus === LoadingStatus.loading) return
    if (!silent) panelCTX.setLoadingStatus(LoadingStatus.loading)

    Promise.all([fetchQuotaInfo(), fetchCurrentTasksInfo(false)])
      .then(() => {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      })
      .catch((e) => {
        console.error(e)
        LevelLogger.error(`current trainings loading error, ${e}`)
        panelCTX.setLoadingStatus(LoadingStatus.error)
      })
  }

  useEffectOnce(() => {
    fetchData()
    const slientFetch = (): void => {
      fetchData(true)
    }
    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, slientFetch)
    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, slientFetch)
    }
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag])

  const operationCallback = (opUnit: TaskOperation | null): Promise<UpdatePriorityResponse> => {
    return (async () => {
      if (opUnit && opUnit.op === 'update_priority_and_rank') {
        AilabCountly.safeReport(CountlyEventKey.dragQueueUpdatePriorityReq)
        try {
          const res = await GlobalApiServerClient.request(ApiServerApiName.UPDATE_PRIORITY_API, {
            priority: opUnit.priority,
            custom_rank: opUnit.custom_rank,
            chain_id: opUnit.chain_id,
          })
          LevelLogger.info(
            `[QUEUE LOG] update chain_id:${opUnit.chain_id}, priority: ${opUnit.priority}, custom_rank: ${opUnit.custom_rank}`,
          )
          AilabCountly.safeReport(CountlyEventKey.dragQueueUpdatePrioritySucc)
          return {
            success: 1,
            timestamp: res.timestamp,
            msg: res.msg,
          }
        } catch (e) {
          return {
            success: 0,
            msg: `${e}`,
            timestamp: 0,
          } as UpdatePriorityResponse
        }
      }

      return Promise.resolve({
        success: 1,
        msg: '',
        timestamp: 0,
      } as UpdatePriorityResponse)
    })()
  }

  const invokeRefreshTasks = (): Promise<void> => {
    return fetchCurrentTasksInfo(true)
  }

  return (
    <div className="current-training-container">
      {(userTaskMap?.scheduled?.sum ?? 0) + (userTaskMap?.queued?.sum ?? 0) > 550 && (
        <Callout className="current-training-callout" intent="primary">
          {i18n.t(i18nKeys.biz_max_show_n_tasks, { n: `${600}` })}
        </Callout>
      )}
      <div className="current-training-inner-container">
        <div className="top">
          <MetricItem
            className="current-training-metrics"
            title={i18n.t(i18nKeys.biz_info_task_working)}
            value={userTaskMap?.scheduled?.sum ?? 0}
            style={DefaultMetricStyle.H2}
            titleColor="GREEN3"
            valueColor="GREEN3"
          />
          <MetricItem
            className="current-training-metrics"
            title={i18n.t(i18nKeys.biz_info_task_queued)}
            value={userTaskMap?.queued?.sum ?? 0}
            style={DefaultMetricStyle.H2}
            titleColor="ORANGE3"
            valueColor="ORANGE3"
          />
          {!window._hf_user_if_in && <div className="current-training-expand" />}
          {window._hf_user_if_in && (
            <div className="left-quota">
              <div className="quota-header">
                <div className="quota-title">{i18n.t(i18nKeys.biz_current_quota_used)}</div>
                <div className="hai-ui-html-select .modifier quota-select">
                  <select
                    onChange={(e) => {
                      setQuotaGroup(e.target.value)
                    }}
                  >
                    {Object.keys(quotaMap).map((key) => {
                      return (
                        <option key={key} selected={key === quotaGroup}>
                          {key}
                        </option>
                      )
                    })}
                  </select>
                  <span className="hai-ui-icon hai-ui-icon-double-caret-vertical" />
                </div>
              </div>
              <div className="quota-list">
                {computeQuotaList(quotaMap, quotaGroup)?.map((quota) => {
                  return (
                    <div className="quota-li-item" key={quotaGroup + quota.priority}>
                      <PriorityIcon priority={quota.priority} />
                      <span className="quota-li-desc">{quota.priority}</span>
                      <Tooltip2
                        content={`Used:${quota.used}, Total:${quota.total}, Limit:${quota.limit}`}
                      >
                        <>
                          {quota.used} / {quota.total}
                          {quota.limit !== '--' && ` (${quota.limit})`}
                        </>
                      </Tooltip2>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="bottom">
          <ExpQueue
            taskInfo={userMixTopTasks}
            operationCallback={operationCallback}
            invokeRefresh={invokeRefreshTasks}
          />
        </div>
      </div>
    </div>
  )
}
