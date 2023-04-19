import type {
  GetReportDataBody,
  GetReportDataListResult,
  GetReportDataResult,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { ReportTaskType, UserRole } from '@hai-platform/shared'
import { useRefState } from '@hai-platform/studio-pages/lib/hooks/useRefState'
import { HTMLSelect } from '@hai-ui/core/lib/esm'
import dayjs from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import { useUpdateEffect } from 'react-use/esm'
import { GrootStatus, useGroot } from 'use-groot'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { conn } from '../../../api/serverConnection'
import { HFPanelContext, LoadingStatus } from '../../../components/HFPanel'
import { DefaultMetricStyle, MetricItem, NO_DATA_TAG } from '../../../components/MetricItem'
import { WebEventsKeys, hfEventEmitter } from '../../../modules/event'
import { numberToWanOrThousands } from '../../../utils/convert'
import { TaskAndPerformanceChart } from './Chart'
import { DatePeriod, MetricMeta, MetricTypes } from './schema'

interface MetricsProps {
  reportDataResponse: GetReportDataResult | undefined | null
  currentTaskType: ReportTaskType
  reportList: GetReportDataListResult
  period: DatePeriod
  role: UserRole
  setCurrentTaskType: (value: ReportTaskType) => void
  setPeriod: (value: DatePeriod) => void
}

const options = [
  MetricTypes.gpu_hours,
  MetricTypes.gpu_rate,
  MetricTypes.gpu_power,
  MetricTypes.gpu_p2u,
  MetricTypes.cpu_rate,
  MetricTypes.mem_usage,
  MetricTypes.ib_usage,
  MetricTypes.chain_task_count,
  MetricTypes.fail_rate,
  MetricTypes.interrupt_task_count,
  MetricTypes.interrupt_task_median,
  MetricTypes.exec_time_mean,
  MetricTypes.exec_time_median,
  MetricTypes.task_wait_mean,
  MetricTypes.task_wait_median,
  MetricTypes.short_task_count,
  MetricTypes.invalid_task_count,
]

// 渲染
export const RangeStaticsRender = (props: MetricsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricTypes>(MetricTypes.gpu_hours)
  const rdr = props.reportDataResponse
  const metricMeta = MetricMeta()
  let gpuHours = rdr?.reportData?.performance?.gpu_hours as string | number
  if (!gpuHours || props.currentTaskType === ReportTaskType.cpu) {
    gpuHours = NO_DATA_TAG
  } else {
    gpuHours = numberToWanOrThousands(gpuHours as number)
  }

  const getDateStr = () => {
    const dateStr = props.reportDataResponse?.dateStr
    if (!dateStr) return dateStr
    if (props.period === DatePeriod.realtime) {
      const beginDate = new Date(`${dateStr}:00:00`)
      const endDate = new Date(beginDate.getTime() + 60 * 60 * 1000)
      return `${dayjs(beginDate).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(endDate).format(
        'YYYY-MM-DD HH:mm',
      )}`
    }
    if (props.period === DatePeriod.weekly) {
      const begin = new Date(dateStr!)
      const end = begin.getTime() + 7 * 24 * 60 * 60 * 1000
      return `${dayjs(begin).format('YYYY-MM-DD')} ~ ${dayjs(end).format('YYYY-MM-DD')}`
    }
    return dateStr
  }

  const highlightClass = (metric: MetricTypes) => {
    if (metric === selectedMetric) {
      return 'highlight'
    }
    return undefined
  }

  return (
    <div className="range-statistics">
      {/* <div className="sub-title">区间统计</div> */}
      <div className="row">
        <div className="main">
          <div className="chart-zone">
            <HTMLSelect
              minimal
              value={selectedMetric}
              onChange={(e) => {
                setSelectedMetric(e.target.value as MetricTypes)
              }}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {metricMeta[o].title}
                </option>
              ))}
            </HTMLSelect>
            {/* <div className="chart-content">chart...{selectedMetric}</div> */}
            <div className="chart-content">
              <TaskAndPerformanceChart
                dataList={props.reportList}
                metric={selectedMetric as any}
                period={props.period}
              />
            </div>
          </div>
          <div className="metrics" style={{ marginTop: 25 }}>
            <MetricItem
              flex={1}
              style={DefaultMetricStyle.H25}
              title={metricMeta[MetricTypes.gpu_hours].title}
              className={highlightClass(MetricTypes.gpu_hours)}
              onClick={() => {
                setSelectedMetric(MetricTypes.gpu_hours)
              }}
              value={gpuHours}
              unit={metricMeta[MetricTypes.gpu_hours].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.gpu_rate].title}
              className={highlightClass(MetricTypes.gpu_rate)}
              onClick={() => {
                setSelectedMetric(MetricTypes.gpu_rate)
              }}
              value={rdr?.reportData?.performance?.gpu_rate ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.gpu_rate].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.cpu_rate].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.cpu_rate)
              }}
              className={highlightClass(MetricTypes.cpu_rate)}
              value={rdr?.reportData?.performance?.cpu_rate ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.cpu_rate].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.mem_usage].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.mem_usage)
              }}
              className={highlightClass(MetricTypes.mem_usage)}
              value={rdr?.reportData?.performance?.mem_usage ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.mem_usage].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.ib_usage].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.ib_usage)
              }}
              className={highlightClass(MetricTypes.ib_usage)}
              value={rdr?.reportData?.performance?.ib_usage ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.ib_usage].unit}
            />
          </div>
          {/* 性能指标第二行，使用 flex 1  div 去占位 */}
          <div className="metrics" style={{ marginTop: 25 }}>
            <div style={{ flex: 1 }} />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.gpu_power].title}
              className={highlightClass(MetricTypes.gpu_power)}
              onClick={() => {
                setSelectedMetric(MetricTypes.gpu_power)
              }}
              value={rdr?.reportData?.performance?.gpu_power ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.gpu_power].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.gpu_p2u].title}
              className={highlightClass(MetricTypes.gpu_p2u)}
              onClick={() => {
                setSelectedMetric(MetricTypes.gpu_p2u)
              }}
              value={rdr?.reportData?.performance?.gpu_p2u ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.gpu_p2u].unit}
            />
            <div style={{ flex: 1 }} />
            <div style={{ flex: 1 }} />
          </div>
          <div className="metrics" style={{ marginTop: 28 }}>
            <MetricItem
              flex={1}
              style={DefaultMetricStyle.H3}
              title={metricMeta[MetricTypes.chain_task_count].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.chain_task_count)
              }}
              className={highlightClass(MetricTypes.chain_task_count)}
              value={rdr?.reportData?.tasks?.chain_task_count ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.chain_task_count].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.interrupt_task_count].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.interrupt_task_count)
              }}
              className={highlightClass(MetricTypes.interrupt_task_count)}
              value={rdr?.reportData?.tasks?.interrupt_task_count ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.interrupt_task_count].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.exec_time_mean].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.exec_time_mean)
              }}
              className={highlightClass(MetricTypes.exec_time_mean)}
              value={rdr?.reportData?.tasks?.exec_time_mean ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.exec_time_mean].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.task_wait_mean].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.task_wait_mean)
              }}
              className={highlightClass(MetricTypes.task_wait_mean)}
              value={rdr?.reportData?.tasks?.task_wait_mean ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.task_wait_mean].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.short_task_count].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.short_task_count)
              }}
              className={highlightClass(MetricTypes.short_task_count)}
              value={rdr?.reportData?.tasks?.short_task_count ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.short_task_count].unit}
            />
          </div>
          <div className="metrics">
            <MetricItem
              flex={1}
              style={DefaultMetricStyle.H3}
              title={metricMeta[MetricTypes.fail_rate].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.fail_rate)
              }}
              className={highlightClass(MetricTypes.fail_rate)}
              value={rdr?.reportData?.tasks?.fail_rate ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.fail_rate].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.interrupt_task_median].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.interrupt_task_median)
              }}
              className={highlightClass(MetricTypes.interrupt_task_median)}
              value={rdr?.reportData?.tasks?.interrupt_task_median ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.interrupt_task_median].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.exec_time_median].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.exec_time_median)
              }}
              className={highlightClass(MetricTypes.exec_time_median)}
              value={rdr?.reportData?.tasks?.exec_time_median ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.exec_time_median].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.task_wait_median].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.task_wait_median)
              }}
              className={highlightClass(MetricTypes.task_wait_median)}
              value={rdr?.reportData?.tasks?.task_wait_median ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.task_wait_median].unit}
            />
            <MetricItem
              flex={1}
              title={metricMeta[MetricTypes.invalid_task_count].title}
              onClick={() => {
                setSelectedMetric(MetricTypes.invalid_task_count)
              }}
              className={highlightClass(MetricTypes.invalid_task_count)}
              value={rdr?.reportData?.tasks?.invalid_task_count ?? NO_DATA_TAG}
              unit={metricMeta[MetricTypes.invalid_task_count].unit}
            />
          </div>
        </div>

        {/* side */}
        <div className="side">
          {props.role === UserRole.INTERNAL && (
            <div className="opt-item">
              <div className="label">{i18n.t(i18nKeys.biz_perf_training_type)}</div>
              <HTMLSelect
                fill
                value={props.currentTaskType}
                onChange={(e) => props.setCurrentTaskType(e.target.value as ReportTaskType)}
              >
                <option value={ReportTaskType.gpu}>GPU</option>
                <option value={ReportTaskType.cpu}>CPU</option>
              </HTMLSelect>
            </div>
          )}
          <div className="opt-item">
            <div className="label">{i18n.t(i18nKeys.biz_perf_statistical_interval)}</div>
            <HTMLSelect
              fill
              value={props.period}
              onChange={(e) => props.setPeriod(e.target.value as DatePeriod)}
            >
              <option value={DatePeriod.daily}>{i18n.t(i18nKeys.base_daily)}</option>
              <option value={DatePeriod.weekly}>{i18n.t(i18nKeys.base_weekly)}</option>
              <option value={DatePeriod.monthly}>{i18n.t(i18nKeys.base_monthly)}</option>
            </HTMLSelect>
            <div className="date-str">{getDateStr()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

//  数据获取等
export const RangeStatistics = (props: { role: UserRole }) => {
  const [period, periodRef, setPeriod] = useRefState<DatePeriod>(DatePeriod.daily)
  const [currentTaskType, currentTaskTypeRef, setCurrentTaskType] = useRefState<ReportTaskType>(
    ReportTaskType.gpu,
  )
  const [reportList, setReportList] = useState<GetReportDataListResult>([])
  const panelCTX = useContext(HFPanelContext)

  const { data, status, req, refresh } = useGroot({
    fetcher: (p: GetReportDataBody) => {
      return GlobalAilabServerClient.request(
        AilabServerApiName.TRAININGS_GET_REPORT_DATA,
        undefined,
        {
          data: p,
        },
      )
    },
    swr: true,
    cacheKey: (params: GetReportDataBody) => conn.getReportDataCacheKey(params),
    auto: false,
  })

  const fetchReportList = (): void => {
    GlobalAilabServerClient.request(AilabServerApiName.TRAININGS_GET_REPORT_DATA_LIST, undefined, {
      data: {
        DatePeriod: periodRef.current,
        dateType: 'last_n',
        dateCount: 20,
        taskType: currentTaskTypeRef.current,
      },
    }).then((reportListResp) => {
      setReportList(reportListResp || [])
    })
  }

  useEffect(() => {
    req({
      DatePeriod: period,
      dateType: 'last',
      taskType: currentTaskType,
    })
    fetchReportList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, currentTaskType])

  useUpdateEffect(() => {
    refresh()
    fetchReportList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelCTX.retryFlag])

  useEffect(() => {
    if (status === GrootStatus.pending || status === GrootStatus.init)
      panelCTX.setLoadingStatus(LoadingStatus.loading)
    if (status === GrootStatus.error) panelCTX.setLoadingStatus(LoadingStatus.error)
    if (status === GrootStatus.success) panelCTX.setLoadingStatus(LoadingStatus.success)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // 定时 refresh
  const tryToFetch = (): void => {
    refresh()
    fetchReportList()
  }

  useEffect(() => {
    hfEventEmitter.on(WebEventsKeys.slientRefreshDashboard, tryToFetch)
    return () => {
      hfEventEmitter.off(WebEventsKeys.slientRefreshDashboard, tryToFetch)
    }
  })

  return (
    <RangeStaticsRender
      role={props.role}
      currentTaskType={currentTaskType}
      period={period}
      reportDataResponse={data}
      reportList={reportList}
      setCurrentTaskType={setCurrentTaskType}
      setPeriod={setPeriod}
    />
  )
}
