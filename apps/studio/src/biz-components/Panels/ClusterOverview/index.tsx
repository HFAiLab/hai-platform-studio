import type { NodeUsageSeriesResult } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type {
  ClusterOverviewDetail,
  TimeRangeScheduleInfoUnit,
} from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { TaskPriority } from '@hai-platform/shared'
import { isCPUGroup, isGPUGroup, taskPriorityNameMap } from '@hai-platform/shared'
import type { SubPayload } from '@hai-platform/studio-pages/lib/index'
import { SubscribeCommands } from '@hai-platform/studio-pages/lib/index'
import { IOFrontier, IoStatus } from '@hai-platform/studio-pages/lib/socket/index'
import type { AllFatalErrorsType } from '@hai-platform/studio-pages/lib/socket/index'
import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { InWrapper } from '@hai-platform/studio-pages/lib/ui-components/innerWrapper'
import { RefreshBtn } from '@hai-platform/studio-pages/lib/ui-components/refresh'
import { PriorityIcon } from '@hai-platform/studio-pages/lib/ui-components/svgIcon/index'
import type { CurrentScheduleTotalInfo } from '@hai-platform/studio-schemas/lib/esm/isomorph/schedule'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import { Button, ButtonGroup } from '@hai-ui/core/lib/esm/components'
import type { ArtColumn } from 'ali-react-table'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { GlobalApiServerClient } from '../../../api/apiServer'
import type { conn } from '../../../api/serverConnection'
import { DynModuleInit } from '../../../components/DynModuleInit'
import { DynamicImportErrorBoundaryFallback } from '../../../components/ErrorBoundary'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { HFDashTable } from '../../../components/HFTable'
import { DefaultMetricStyle, MetricItem } from '../../../components/MetricItem'
import type { UsageItem } from '../../../components/UsageBar'
import { UsageBar } from '../../../components/UsageBar'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { CONSTS, LevelLogger, getToken } from '../../../utils'

import './index.scss'

type OverViewType = 'gpu' | 'cpu'

const Loading = () => {
  return <DynModuleInit />
}

const UsageSeriesChart = React.lazy(async () => {
  return {
    default: (await import(/* webpackChunkName: "dyn-chart" */ '../../../dyn-components/Chart'))
      .UsageSeriesChart,
  }
})

export const GlobalOverviewUI = (props: {
  currentOverViewType: OverViewType
  setCurrentOverviewType: (nextType: OverViewType) => void
  nodeUsageSeries: NodeUsageSeriesResult | null
  clusterOverview: ClusterOverviewDetail | null
  taskOverview: conn.IGlobalTaskOverview | null
  taskError?: boolean
  clusterError?: boolean
  taskLoading?: boolean
  clusterLoading?: boolean
  fetchOverView: () => void
  hideRefresh?: boolean
}): JSX.Element => {
  const { taskOverview } = props
  const { clusterOverview } = props
  const [rangeInfo, setRangeInfo] = useState<TimeRangeScheduleInfoUnit | null>(null)

  const columnsOfPaths = [
    {
      code: 'priority',
      name: i18n.t(i18nKeys.biz_priority),
      align: 'left',
      render: (p) => {
        return (
          <>
            <PriorityIcon priority={p.value} />
            {p.name}
          </>
        )
      },
      width: 2,
    },
    {
      code: 'scheduled',
      name: i18n.t(i18nKeys.biz_info_task_working),
      width: 1,
      align: 'left',
    },
    {
      code: 'queued',
      name: i18n.t(i18nKeys.biz_info_task_queued),
      width: 1,
      align: 'left',
    },
  ] as Array<ArtColumn>

  const dataSource = Object.keys(taskPriorityNameMap || [])
    .sort((a, b) => {
      return Number(b) - Number(a)
    })
    .map((priorityKey) => {
      const priorityValue = Number(priorityKey)
      const priorityName = taskPriorityNameMap[priorityKey as unknown as TaskPriority]
      const info = (taskOverview || {})[priorityValue] || { scheduled: 0, queued: 0 }
      return {
        priority: {
          name: priorityName,
          value: priorityValue,
        },
        scheduled: info.scheduled || 0,
        queued: info.queued || 0,
      }
    })
  const calculateCurrentCount = () => {
    if (!taskOverview) {
      return {
        scheduled: '-',
        queued: '-',
      }
    }
    return Object.values(taskOverview).reduce(
      (curr, next) => {
        curr.scheduled += next.scheduled
        curr.queued += next.queued
        return curr
      },
      {
        scheduled: 0,
        queued: 0,
      } as CurrentScheduleTotalInfo,
    )
  }

  const currentCount = calculateCurrentCount()

  const metrics = {
    other: {
      name: i18n.t(i18nKeys.biz_info_nodes_other),
      amount: clusterOverview?.other ?? 0,
      color: 'ORANGE3',
    },
    total: {
      name: i18n.t(i18nKeys.biz_info_nodes_total),
      amount: clusterOverview?.total ?? 0,
    },
    working: {
      name: i18n.t(i18nKeys.biz_info_nodes_total_used),
      amount: clusterOverview?.working ?? 0,
      color: 'GREEN3',
    },
    free: {
      name:
        currentCount && currentCount.queued
          ? i18n.t(i18nKeys.biz_info_nodes_free_but_show_schedule)
          : i18n.t(i18nKeys.biz_info_nodes_free),
      amount: clusterOverview?.free ?? 0,
      color: 'BLUE4',
    },
  }

  const usageRate = clusterOverview?.usage_rate

  const fetchRangeScheduleInfo = (): Promise<void> => {
    const start_time = dayjs(
      new Date(Date.now() - CONSTS.TASK_OVERVIEW_RANGE_SCHEDULE_HOURS * ONEHOUR),
    ).format('YYYY-MM-DD HH:mm:ss')
    const end_time = dayjs().format('YYYY-MM-DD HH:mm:ss')

    return GlobalApiServerClient.request(ApiServerApiName.GET_TIME_RANGE_SCHEDULE_INFO, {
      start_time,
      end_time,
    }).then((resRangeInfo) => {
      // eslint-disable-next-line no-nested-ternary
      const filterGroups = props.currentOverViewType === 'cpu' ? isCPUGroup : isGPUGroup
      setRangeInfo({
        created: resRangeInfo.detail.created
          .filter((item) => filterGroups(item.group))
          .reduce((a, b) => a + b.count, 0),
        finished: resRangeInfo.detail.finished
          .filter((item) => filterGroups(item.group))
          .reduce((a, b) => a + b.count, 0),
      })
    })
  }

  useEffect(() => {
    fetchRangeScheduleInfo()

    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, fetchRangeScheduleInfo)

    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, fetchRangeScheduleInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentOverViewType])

  return (
    <div className={classNames('global-view hf')} id="studio-home-global-view">
      {!props.hideRefresh && (
        <div className="global-view-refresh-container">
          <RefreshBtn
            onClick={() => {
              props.fetchOverView()
            }}
            small
            svgOnly
          />
        </div>
      )}
      <p className={classNames('gpu-cpu-switch-container')}>
        <ButtonGroup>
          {['gpu', 'cpu'].map((typeKey) => {
            return (
              <Button
                small
                outlined
                active={typeKey === props.currentOverViewType}
                onClick={() => {
                  props.setCurrentOverviewType(typeKey as OverViewType)
                }}
              >
                {typeKey.toUpperCase()}
              </Button>
            )
          })}
        </ButtonGroup>
      </p>

      {!props.clusterLoading && !props.clusterError && clusterOverview && (
        <>
          <MetricItem
            style={DefaultMetricStyle.H2}
            valueColor={(usageRate ?? 0) > 0.85 ? 'ORANGE3' : undefined}
            title={i18n.t(i18nKeys.biz_info_cluster_usage_ratio)}
            value={typeof usageRate === 'number' ? (usageRate * 100).toFixed(1) : '--'}
            unit="%"
          />

          <div className="flexRow">
            <MetricItem title={metrics.total.name} value={metrics.total.amount} />
            <MetricItem title={metrics.working.name} value={metrics.working.amount} />
            <MetricItem title={metrics.free.name} value={metrics.free.amount} />
            <MetricItem
              title={metrics.other.name}
              value={metrics.other.amount}
              help={i18n.t(i18nKeys.biz_info_nodes_other_help)}
            />
          </div>

          <UsageBar
            className="bar"
            data={[
              metrics.working as UsageItem,
              metrics.free as UsageItem,
              metrics.other as UsageItem,
            ]}
            total={metrics.total.amount}
            showPercentage
            showTooltip
            height={30}
          />
          {props.nodeUsageSeries && !!props.nodeUsageSeries.length && (
            <>
              <div className="usage-chart-title">
                {i18n.t(i18nKeys.biz_info_node_usage_series_chart_title)}
              </div>
              <ReactErrorBoundary errorComp={<DynamicImportErrorBoundaryFallback />}>
                <React.Suspense fallback={<Loading />}>
                  <UsageSeriesChart data={props.nodeUsageSeries} height={50} />
                </React.Suspense>
              </ReactErrorBoundary>
            </>
          )}
        </>
      )}

      {props.clusterError && (
        <div className="overview-error-container">
          <p className="overview-error">{i18n.t(i18nKeys.biz_info_get_cluster_error)}</p>
        </div>
      )}

      <div className="subTitle">{i18n.t(i18nKeys.biz_info_cluster_tasks)}</div>
      <div className="range-info-container">
        <MetricItem
          title={i18n.t(i18nKeys.biz_info_task_working)}
          value={currentCount ? currentCount.scheduled : '-'}
        />
        <MetricItem
          title={i18n.t(i18nKeys.biz_info_task_queued)}
          value={currentCount ? currentCount.queued : '-'}
        />
        <MetricItem
          title={i18n.t(i18nKeys.biz_range_schedule_add, {
            n: `${CONSTS.TASK_OVERVIEW_RANGE_SCHEDULE_HOURS}`,
          })}
          value={rangeInfo ? rangeInfo.created : '-'}
        />
        <MetricItem
          title={i18n.t(i18nKeys.biz_range_schedule_finish, {
            n: `${CONSTS.TASK_OVERVIEW_RANGE_SCHEDULE_HOURS}`,
          })}
          value={rangeInfo ? rangeInfo.finished : '-'}
        />
      </div>

      {!props.taskError && taskOverview && (
        <>
          <HFDashTable
            className="taskTable"
            style={{ overflow: 'auto' } as React.CSSProperties}
            columns={columnsOfPaths}
            dataSource={dataSource}
            isLoading={props.taskLoading}
          />
          {}
        </>
      )}

      {props.taskError && (
        <div className="overview-error-container">
          <p className="overview-error">{i18n.t(i18nKeys.biz_info_get_tasks_error)}</p>
        </div>
      )}
    </div>
  )
}

export const IOGlobalOverview = (props: {
  ioFatalErrorCallback: (error: AllFatalErrorsType) => void
  disConnectedCallback: () => void
  connectedCallback: () => void
  currentOverViewType: OverViewType
  setCurrentOverviewType: (nextType: OverViewType) => void
}): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  // const [updateDate, setUpdateDate] = useState(new Date())
  const [clusterOverview, setClusterOverview] = useState<ClusterOverviewDetail | null>(null)
  const [taskOverview, setTaskOverview] = useState<conn.IGlobalTaskOverview | null>(null)
  const [nodeUsageSeries, setNodeUsageSeries] = useState<NodeUsageSeriesResult | null>(null)
  const [taskLoading, setTaskLoading] = useState(true)
  const [clusterLoading, setClusterLoading] = useState(true)
  const [taskError, setTaskError] = useState(false)
  const [clusterError, setClusterError] = useState(false)
  const successCountRef = React.useRef(new Set<string>())

  const fetchOverView = () => {}

  useEffect(() => {
    const clusterOverviewChangeCallback = (
      payload: SubPayload<SubscribeCommands.ClusterOverview2>,
    ) => {
      setClusterLoading(false)

      successCountRef.current.add('cluster')
      if (successCountRef.current.size === 3) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }

      if (!payload.content) {
        setClusterError(true)
        return
      }
      setClusterError(false)

      setClusterOverview(payload.content as ClusterOverviewDetail)
    }
    const nodeUsageSeriesChangeCallback = (
      payload: SubPayload<SubscribeCommands.NodeUsageSeries>,
    ) => {
      successCountRef.current.add('nodeUsageSeries')
      if (successCountRef.current.size === 3) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
      setNodeUsageSeries(payload.content as NodeUsageSeriesResult)
    }

    const taskSuccessCallback = () => {
      setTaskLoading(false)
      setTaskError(false)

      successCountRef.current.add('task')
      if (successCountRef.current.size === 3) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
    }

    const tasksOverviewChangeCallback = (payload: SubPayload<SubscribeCommands.TaskOverview2>) => {
      taskSuccessCallback()

      if (!payload.content) {
        setTaskError(true)
        return
      }

      setTaskOverview(payload.content as conn.IGlobalTaskOverview)
    }

    IOFrontier.lazyInit(getToken())
    IOFrontier.getInstance().setLogger(LevelLogger)
    IOFrontier.addFatalErrorCallback(props.ioFatalErrorCallback)
    IOFrontier.addConnectedCallback(props.connectedCallback)
    IOFrontier.addDisConnectCallback(props.disConnectedCallback)

    const clusterSubId = IOFrontier.getInstance().sub(
      SubscribeCommands.ClusterOverview2,
      {
        query: {
          taskType: props.currentOverViewType,
        },
      },
      clusterOverviewChangeCallback,
    )
    let tasksSubId: number | null = null
    tasksSubId = IOFrontier.getInstance().sub(
      SubscribeCommands.TaskOverview2,
      {
        query: {
          taskType: props.currentOverViewType,
        },
      },
      tasksOverviewChangeCallback,
    )
    const nodeUsageSeriesSubId = IOFrontier.getInstance().sub(
      SubscribeCommands.NodeUsageSeries,
      {
        query: { type: props.currentOverViewType },
      },
      nodeUsageSeriesChangeCallback,
    )

    return () => {
      IOFrontier.removeFatalErrorCallback(props.ioFatalErrorCallback)
      IOFrontier.removeConnectedCallback(props.connectedCallback)
      IOFrontier.removeDisConnectCallback(props.disConnectedCallback)
      IOFrontier.getInstance().unsub(clusterSubId)
      IOFrontier.getInstance().unsub(nodeUsageSeriesSubId)
      if (tasksSubId) IOFrontier.getInstance().unsub(tasksSubId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentOverViewType])

  return (
    <GlobalOverviewUI
      nodeUsageSeries={nodeUsageSeries}
      currentOverViewType={props.currentOverViewType}
      setCurrentOverviewType={props.setCurrentOverviewType}
      clusterOverview={clusterOverview}
      taskOverview={taskOverview}
      taskError={taskError}
      clusterError={clusterError}
      taskLoading={taskLoading}
      clusterLoading={clusterLoading}
      fetchOverView={fetchOverView}
      hideRefresh
    />
  )
}

export const HttpGlobalOverview = (props: {
  currentOverViewType: OverViewType
  setCurrentOverviewType: (nextType: OverViewType) => void
}): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  // const [updateDate, setUpdateDate] = useState(new Date())
  const [clusterOverview, setClusterOverview] = useState<ClusterOverviewDetail | null>(null)
  const [taskOverview, setTaskOverview] = useState<conn.IGlobalTaskOverview | null>(null)
  const [nodeUsageSeries, setNodeUsageSeries] = useState<NodeUsageSeriesResult | null>(null)
  const [taskLoading, setTaskLoading] = useState(false)
  const [clusterLoading, setClusterLoading] = useState(false)
  const [taskError, setTaskError] = useState(false)
  const [clusterError, setClusterError] = useState(false)
  const successCountRef = React.useRef(new Set<string>())

  const fetchData = () => {
    if (taskLoading) return

    setTaskLoading(true)
    setTaskError(false)
    setClusterLoading(true)
    setClusterError(false)

    const taskSuccCallback = () => {
      setTaskLoading(false)
      successCountRef.current.add('tasks')
      if (successCountRef.current.size === 3) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
    }

    GlobalAilabServerClient.request(AilabServerApiName.GET_TASK_TYPED_OVERVIEW, {
      taskType: props.currentOverViewType,
    })
      .then((res) => {
        setTaskOverview(res)
        taskSuccCallback()
      })
      .catch((e) => {
        LevelLogger.error('task overview get error:', e)
        setTaskError(true)
        setTaskLoading(false)
      })
    GlobalAilabServerClient.request(AilabServerApiName.GET_NODE_USAGE_SERIES, {
      type: props.currentOverViewType,
    }).then((res) => {
      setNodeUsageSeries(res)
      successCountRef.current.add('nodeUsageSeries')
      if (successCountRef.current.size === 3) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
    })
    GlobalApiServerClient.request(ApiServerApiName.GET_CLUSTER_OVERVIEW_FOR_CLIENT)
      .then((res) => {
        setClusterOverview(props.currentOverViewType === 'gpu' ? res.gpu_detail : res.cpu_detail)
        setClusterLoading(false)

        successCountRef.current.add('cluster')
        if (successCountRef.current.size === 3) {
          panelCTX.setLoadingStatus(LoadingStatus.success)
        }
      })
      .catch((e) => {
        LevelLogger.error('cluster overview get error:', e)
        setClusterError(true)
        setTaskLoading(false)
      })
  }

  useEffectOnce(() => {
    fetchData()
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag, props.currentOverViewType])

  return (
    <GlobalOverviewUI
      nodeUsageSeries={nodeUsageSeries}
      currentOverViewType={props.currentOverViewType}
      clusterOverview={clusterOverview}
      setCurrentOverviewType={props.setCurrentOverviewType}
      taskOverview={taskOverview}
      taskError={taskError}
      clusterError={clusterError}
      taskLoading={taskLoading}
      clusterLoading={clusterLoading}
      fetchOverView={fetchData}
    />
  )
}

export const GlobalOverview = (): JSX.Element => {
  const [useIO, setUseIO] = useState<boolean>(IOFrontier.ioStatus !== IoStatus.fataled)
  const [currentOverViewType, setCurrentOverviewType] = useState<OverViewType>('gpu')
  const ioFatalErrorCallback = (error: AllFatalErrorsType) => {
    LevelLogger.info(`GlobalOverview ioFatalErrorCallback: ${error}`)
    setUseIO(false)
  }
  const connectedCallback = () => {
    setUseIO(true)
  }
  const disConnectedCallback = () => {}

  return (
    <>
      {useIO && (
        <IOGlobalOverview
          currentOverViewType={currentOverViewType}
          setCurrentOverviewType={setCurrentOverviewType}
          ioFatalErrorCallback={ioFatalErrorCallback}
          disConnectedCallback={disConnectedCallback}
          connectedCallback={connectedCallback}
        />
      )}
      {!useIO && (
        <HttpGlobalOverview
          currentOverViewType={currentOverViewType}
          setCurrentOverviewType={setCurrentOverviewType}
        />
      )}
    </>
  )
}
