// 嵌入的 echarts 图表

import type { GetReportDataListResult } from '@hai-platform/client-ailab-server'
import { ReactErrorBoundary } from '@hai-platform/studio-pages/lib/ui-components/errorBoundary'
import { Colors } from '@hai-ui/core/lib/esm'
import dayjs from 'dayjs'
import React, { useCallback } from 'react'
import { DynModuleInit } from '../../../components/DynModuleInit'
import { DynamicImportErrorBoundaryFallback } from '../../../components/ErrorBoundary'
import { DatePeriod, MetricMeta, MetricTypes } from './schema'

// eslint-disable-next-line react/no-unstable-nested-components
const Loading = () => {
  return <DynModuleInit />
}

const CombinedChart = React.lazy(async () => {
  return {
    default: (await import(/* webpackChunkName: "dyn-chart" */ '../../../dyn-components/Chart'))
      .CombinedChart,
  }
})

type PointItem = {
  [k in MetricTypes]: number | null
} & { rawDate: string }

const color = { area: '#0000', line: Colors.BLUE4, item: Colors.BLUE3 }

const genDataList = (reportList: GetReportDataListResult) => {
  if (!reportList || reportList.length === 0) {
    return null
  }
  let noData = true
  const dataList = reportList.map((item) => {
    const d = {
      rawDate: item.dateStr,
    } as PointItem

    // perf
    d[MetricTypes.gpu_hours] = item.reportData?.performance?.gpu_hours || null
    d[MetricTypes.cpu_rate] = item.reportData?.performance?.cpu_rate || null
    d[MetricTypes.gpu_rate] = item.reportData?.performance?.gpu_rate || null
    d[MetricTypes.gpu_power] = item.reportData?.performance?.gpu_power || null
    d[MetricTypes.gpu_p2u] = item.reportData?.performance?.gpu_p2u || null
    d[MetricTypes.ib_usage] = item.reportData?.performance?.ib_usage || null
    d[MetricTypes.mem_usage] = item.reportData?.performance?.mem_usage || null
    // task
    d[MetricTypes.chain_task_count] = item.reportData?.tasks?.chain_task_count || null
    d[MetricTypes.exec_time_mean] = item.reportData?.tasks?.exec_time_mean || null
    d[MetricTypes.exec_time_median] = item.reportData?.tasks?.exec_time_median || null
    d[MetricTypes.exec_true_ratio] = item.reportData?.tasks?.exec_true_ratio || null
    d[MetricTypes.extreme_high_percent] = item.reportData?.tasks?.extreme_high_percent || null
    d[MetricTypes.fail_rate] = item.reportData?.tasks?.fail_rate || null
    d[MetricTypes.interrupt_task_count] = item.reportData?.tasks?.interrupt_task_count || null
    d[MetricTypes.interrupt_task_median] = item.reportData?.tasks?.interrupt_task_median || null
    d[MetricTypes.invalid_task_count] = item.reportData?.tasks?.invalid_task_count || null
    d[MetricTypes.short_task_count] = item.reportData?.tasks?.short_task_count || null
    d[MetricTypes.task_wait_mean] = item.reportData?.tasks?.task_wait_mean || null
    d[MetricTypes.task_wait_median] = item.reportData?.tasks?.task_wait_median || null
    if (d[MetricTypes.gpu_rate] !== null || d[MetricTypes.chain_task_count] !== null) {
      noData = false
    }
    return d
  })
  return noData ? null : dataList
}

const tipFormatter = (data: PointItem | null, key: MetricTypes, period: DatePeriod) => {
  const metricMeta = MetricMeta()
  if (!data) return null
  let value: number | string | null | undefined = data[key]
  if (typeof value === 'number') {
    value = `${value.toFixed(metricMeta[key].fixed)} ${metricMeta[key].unit}`
  }
  let desc = ''

  if (period === DatePeriod.realtime) {
    const currentTime = new Date(`${data.rawDate}:00:00`)
    const nextTime = new Date(currentTime.getTime() + 60 * 60 * 1000)
    desc = `${dayjs(currentTime).format('HH:mm:ss')} ~ ${dayjs(nextTime).format('HH:mm:ss')}`
  } else if (period === DatePeriod.weekly) {
    const currentTime = new Date(data.rawDate)
    const nextTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000)
    desc = `${dayjs(currentTime).format('YYYY-MM-DD')} ~ ${dayjs(nextTime).format('YYYY-MM-DD')}`
  } else {
    const currentTime = new Date(data.rawDate)
    desc = dayjs(currentTime).format(period === DatePeriod.daily ? 'YYYY-MM-DD' : 'YYYY-MM')
  }

  const tipDom = document.createElement('div')
  const valueDom = document.createElement('b')
  valueDom.innerHTML = ` ${value}`
  const descDom = document.createElement('span')
  descDom.innerHTML = desc
  tipDom.appendChild(descDom)
  tipDom.appendChild(valueDom)

  return tipDom
}

export const TaskAndPerformanceChart = (props: {
  dataList: GetReportDataListResult
  metric: MetricTypes
  period: DatePeriod
  yLabel?: boolean
  grid?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}) => {
  const dataList = useCallback(() => genDataList(props.dataList), [props.dataList])
  return (
    <ReactErrorBoundary errorComp={<DynamicImportErrorBoundaryFallback />}>
      <React.Suspense fallback={<Loading />}>
        <CombinedChart
          className="chart"
          chartType="line"
          xKey="rawDate"
          yKey={props.metric}
          showXAxis
          yLabel={props.yLabel}
          grid={props.grid}
          showTooltip
          height={140}
          data={dataList()}
          formatter={(data) => {
            const rawData = data[0]?.data as PointItem | null
            const key = props.metric
            return tipFormatter(rawData, key, props.period)
          }}
          color={color}
        />
      </React.Suspense>
    </ReactErrorBoundary>
  )
}
