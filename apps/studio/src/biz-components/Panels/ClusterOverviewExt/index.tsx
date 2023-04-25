import type { NodeUsageSeriesResult } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type {
  ClusterOverviewDetail,
  TimeRangeScheduleInfoUnit,
} from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { SubPayload } from '@hai-platform/studio-pages/lib/index'
import { SubscribeCommands } from '@hai-platform/studio-pages/lib/index'
import { IOFrontier, IoStatus } from '@hai-platform/studio-pages/lib/socket/index'
import type { AllFatalErrorsType } from '@hai-platform/studio-pages/lib/socket/index'
import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { RefreshBtn } from '@hai-platform/studio-pages/lib/ui-components/refresh'
import type { CurrentScheduleTotalInfo } from '@hai-platform/studio-schemas/lib/esm/isomorph/schedule'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useUpdateEffect from 'react-use/esm/useUpdateEffect'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { GlobalApiServerClient } from '../../../api/apiServer'
import { conn } from '../../../api/serverConnection'
import { DynModuleInit } from '../../../components/DynModuleInit'
import { DynamicImportErrorBoundaryFallback } from '../../../components/ErrorBoundary'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { DefaultMetricStyle, MetricItem } from '../../../components/MetricItem'
import type { UsageItem } from '../../../components/UsageBar'
import { UsageBar } from '../../../components/UsageBar'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { CONSTS, LevelLogger, getToken } from '../../../utils'

const Loading = () => {
  return <DynModuleInit />
}

const UsageSeriesExternalChart = React.lazy(async () => {
  return {
    default: (await import(/* webpackChunkName: "dyn-chart" */ '../../../dyn-components/Chart'))
      .UsageSeriesExternalChart,
  }
})

export const GlobalOverviewExtUI = (props: {
  nodeUsageSeries: NodeUsageSeriesResult | null
  clusterOverview: ClusterOverviewDetail | null
  clusterError?: boolean
  clusterLoading?: boolean
  fetchOverView: () => void
  hideRefresh?: boolean
}): JSX.Element => {
  const { clusterOverview } = props
  const [rangeInfo, setRangeInfo] = useState<TimeRangeScheduleInfoUnit | null>(null)
  const [externalCurrentTotalCount, setExternalCurrentTotalCount] =
    useState<CurrentScheduleTotalInfo | null>(null)

  const fetchCurrentTotalCountOnlyForExternal = (): Promise<void> => {
    return conn.getExternalTaskCount().then((totalCount) => {
      setExternalCurrentTotalCount(totalCount)
    })
  }

  const currentCount = externalCurrentTotalCount

  const metrics = {
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
      const filterGroups = ['training']
      setRangeInfo({
        created: resRangeInfo.detail.created
          .filter((item) => filterGroups.includes(item.group))
          .reduce((a, b) => a + b.count, 0),
        finished: resRangeInfo.detail.finished
          .filter((item) => filterGroups.includes(item.group))
          .reduce((a, b) => a + b.count, 0),
      })
    })
  }

  useEffect(() => {
    fetchRangeScheduleInfo()
    fetchCurrentTotalCountOnlyForExternal()

    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, fetchRangeScheduleInfo)
    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, fetchCurrentTotalCountOnlyForExternal)

    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, fetchRangeScheduleInfo)
      hfEventEmitter.off(
        WebEventsKeys.slientRefreshDashboard,
        fetchCurrentTotalCountOnlyForExternal,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={classNames('global-view hf', 'external')} id="studio-home-global-view">
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

      {!props.clusterLoading && !props.clusterError && clusterOverview && (
        <>
          <MetricItem
            style={DefaultMetricStyle.H2}
            valueColor={(usageRate ?? 0) > 0.85 ? 'ORANGE3' : undefined}
            title={i18n.t(i18nKeys.biz_info_cluster_usage_ratio)}
            value={
              typeof usageRate === 'number' && usageRate !== 0 ? (usageRate * 100).toFixed(1) : '--'
            }
            unit="%"
          />

          <div className="flexRow">
            <MetricItem title={metrics.total.name} value={metrics.total.amount} />
            <MetricItem title={metrics.working.name} value={metrics.working.amount} />
            <MetricItem title={metrics.free.name} value={metrics.free.amount} />
          </div>

          <UsageBar
            className="bar"
            data={[metrics.working as UsageItem, metrics.free as UsageItem]}
            total={metrics.total.amount}
            showPercentage
            showTooltip
            height={30}
          />
          {props.nodeUsageSeries && !!props.nodeUsageSeries.length && (
            <>
              <div className="usage-chart-title">
                {i18n.t(i18nKeys.biz_info_spare_node_usage_series_chart_title)}
              </div>
              <ReactErrorBoundary errorComp={<DynamicImportErrorBoundaryFallback />}>
                <React.Suspense fallback={<Loading />}>
                  <UsageSeriesExternalChart data={props.nodeUsageSeries} height={50} />
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
    </div>
  )
}

export const IOGlobalOverviewExt = (props: {
  ioFatalErrorCallback: (error: AllFatalErrorsType) => void
  disConnectedCallback: () => void
  connectedCallback: () => void
}): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  // const [updateDate, setUpdateDate] = useState(new Date())
  const [clusterOverview, setClusterOverview] = useState<ClusterOverviewDetail | null>(null)
  const [nodeUsageSeries, setNodeUsageSeries] = useState<NodeUsageSeriesResult | null>(null)
  const [clusterLoading, setClusterLoading] = useState(true)
  const [clusterError, setClusterError] = useState(false)
  const successCountRef = React.useRef(new Set<string>())

  const fetchOverView = () => {}

  useEffect(() => {
    const clusterOverviewChangeCallback = (
      payload: SubPayload<SubscribeCommands.ClusterOverview2>,
    ) => {
      setClusterLoading(false)

      successCountRef.current.add('cluster')
      if (successCountRef.current.size === 2) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }

      if (!payload.content) {
        setClusterError(true)
        return
      }
      setClusterError(false)

      setClusterOverview(payload.content as ClusterOverviewDetail)
      // setUpdateDate(new Date())
    }
    const nodeUsageSeriesChangeCallback = (
      payload: SubPayload<SubscribeCommands.NodeUsageSeries>,
    ) => {
      successCountRef.current.add('nodeUsageSeries')
      if (successCountRef.current.size === 2) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
      setNodeUsageSeries(payload.content as NodeUsageSeriesResult)
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
          taskType: 'external',
        },
      },
      clusterOverviewChangeCallback,
    )

    const nodeUsageSeriesSubId = IOFrontier.getInstance().sub(
      SubscribeCommands.NodeUsageSeries,
      {
        query: { type: 'external' },
      },
      nodeUsageSeriesChangeCallback,
    )

    return () => {
      IOFrontier.removeFatalErrorCallback(props.ioFatalErrorCallback)
      IOFrontier.removeConnectedCallback(props.connectedCallback)
      IOFrontier.removeDisConnectCallback(props.disConnectedCallback)
      IOFrontier.getInstance().unsub(clusterSubId)
      IOFrontier.getInstance().unsub(nodeUsageSeriesSubId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <GlobalOverviewExtUI
      nodeUsageSeries={nodeUsageSeries}
      clusterOverview={clusterOverview}
      clusterError={clusterError}
      clusterLoading={clusterLoading}
      fetchOverView={fetchOverView}
      hideRefresh
    />
  )
}

export const HttpGlobalOverviewExt = (): JSX.Element => {
  const panelCTX = useContext(HFPanelContext)
  // const [updateDate, setUpdateDate] = useState(new Date())
  const [clusterOverview, setClusterOverview] = useState<ClusterOverviewDetail | null>(null)
  const [nodeUsageSeries, setNodeUsageSeries] = useState<NodeUsageSeriesResult | null>(null)
  const [clusterLoading, setClusterLoading] = useState(false)
  const [clusterError, setClusterError] = useState(false)
  const successCountRef = React.useRef(new Set<string>())

  const fetchData = () => {
    setClusterLoading(true)
    setClusterError(false)

    GlobalAilabServerClient.request(AilabServerApiName.GET_NODE_USAGE_SERIES, {
      type: 'external' as any,
    }).then((res) => {
      setNodeUsageSeries(res)
      successCountRef.current.add('nodeUsageSeries')
      if (successCountRef.current.size === 2) {
        panelCTX.setLoadingStatus(LoadingStatus.success)
      }
    })
    GlobalAilabServerClient.request(AilabServerApiName.GET_EXTERNAL_CLUSTER_OVERVIEW)
      .then((res) => {
        setClusterOverview(res)
        setClusterLoading(false)

        successCountRef.current.add('cluster')
        if (successCountRef.current.size === 2) {
          panelCTX.setLoadingStatus(LoadingStatus.success)
        }
      })
      .catch((e) => {
        LevelLogger.error('cluster overview get error:', e)
        setClusterError(true)
      })
  }

  useEffectOnce(() => {
    fetchData()
  })

  useUpdateEffect(() => {
    fetchData()
  }, [panelCTX.retryFlag])

  return (
    <GlobalOverviewExtUI
      nodeUsageSeries={nodeUsageSeries}
      clusterOverview={clusterOverview}
      clusterError={clusterError}
      clusterLoading={clusterLoading}
      fetchOverView={fetchData}
    />
  )
}

export const GlobalOverviewExt = (): JSX.Element => {
  const [useIO, setUseIO] = useState<boolean>(IOFrontier.ioStatus !== IoStatus.fatal)
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
        <IOGlobalOverviewExt
          ioFatalErrorCallback={ioFatalErrorCallback}
          disConnectedCallback={disConnectedCallback}
          connectedCallback={connectedCallback}
        />
      )}
      {!useIO && <HttpGlobalOverviewExt />}
    </>
  )
}
