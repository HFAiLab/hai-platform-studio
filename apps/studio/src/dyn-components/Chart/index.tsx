import type { NodeUsageSeriesResult } from '@hai-platform/client-ailab-server'
import classNames from 'classnames'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import React, { useMemo } from 'react'
import echarts from './echarts'

interface CombinedChartProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: Object[] | null
  chartType: 'bar' | 'line' | 'pie'
  xKey?: string
  yKey?: string
  height?: number
  width?: number
  showXAxis?: boolean
  showTooltip?: boolean
  showAxisPointer?: boolean
  className?: string
  yLabel?: boolean
  grid?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  color?: {
    line?: string
    area?: string
    item?: string
  }
  formatter: (data: any[]) => HTMLDivElement | null | string
  theme?: 'light' | 'dark'
}

const getOption = (p: CombinedChartProps): any => {
  const color = p.color ?? {}

  // hint: pie 版本需要的 options 格式和其他的有一点冲突
  if (p.chartType === 'pie') {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: p.formatter ?? undefined,
      },
      series: [
        {
          type: p.chartType,
          data: p.data,
        },
      ],
    }
  }

  return {
    animation: false,
    xAxis: {
      type: 'category',
      show: p.showXAxis,
      axisPointer: {
        show: true,
        snap: true,
        label: {
          show: p.showAxisPointer ?? false,
        },
      },
      boundaryGap: p.chartType === 'bar',
    },
    tooltip: {
      show: p.showTooltip,
      trigger: 'item',
      formatter: p.formatter ?? undefined,
    },
    yAxis: {
      type: 'value',
      show: true,
      axisLabel: { show: p.yLabel ?? false },
      splitLine: {
        lineStyle: { color: '#AAAAAA17' },
      },
    },
    dataset: { source: p.data ?? [] },
    series: [
      {
        type: p.chartType,
        encode: {
          x: p.xKey,
          y: p.yKey,
        },
        areaStyle: { color: color.area },
        lineStyle: { color: color.line },
        itemStyle: { color: color.item },
      },
    ],
    // height: p.height ?? undefined,
    height: p.height ? p.height - (p.showXAxis ? 44 : 30) : undefined,
    width: p.width ?? undefined,
    grid: {
      top: p.grid?.top ?? 15,
      bottom: p.grid?.bottom ?? 0,
      // eslint-disable-next-line no-nested-ternary
      left: p.grid?.left ?? (p.showXAxis ? 20 : 10),
      right: p.grid?.right ?? (p.showXAxis ? 20 : 10),
    },
  }
}

export const CombinedChart = (p: CombinedChartProps) => {
  const op = useMemo(() => getOption(p), [p])

  if (!p.data) {
    return (
      <div
        className={classNames('aiui-CombinedChart', p.className)}
        style={{
          height: p.height ?? 'unset',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--hai-ui-text-other)',
        }}
      >
        <div>No data for chart</div>
      </div>
    )
  }
  return (
    <ReactEChartsCore
      echarts={echarts}
      className={classNames('aiui-CombinedChart', p.className)}
      option={op}
      style={{ height: p.height ?? 'unset' }}
      theme={p.theme ?? 'light'}
      opts={{ renderer: 'canvas' }}
    />
  )
}

// === UsageSeriesChart ===

export interface UsageSeriesProps {
  data: NodeUsageSeriesResult
  className?: string
  height?: number
  theme?: 'light' | 'dark'
}
const genUsageOp = (data: NodeUsageSeriesResult) => {
  return {
    tooltip: {
      trigger: 'axis',
      // textStyle: {
      //   color: 'var(--hai-ui-layout-m1)',
      // },
      // backgroundColor: 'var(--hai-ui-text-primary)',
    },
    animation: false,
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      containLabel: false,
    },
    xAxis: [
      {
        type: 'time',
        boundaryGap: false,
      },
    ],
    yAxis: [
      {
        type: 'value',
        max: (value: any) => value.max,
        // splitLine: { show: false },
      },
    ],

    dataset: { source: data },
    series: [
      {
        name: '工作中',
        type: 'line',
        stack: 'Total',
        encode: {
          x: 'time',
          y: 'working',
        },

        color: '#238551',

        emphasis: {
          focus: 'series',
        },
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0.5, width: 1 },
        areaStyle: { opacity: 0.85 },
      },
      {
        name: '空闲/调度中',
        type: 'line',
        stack: 'Total',
        color: '#4c90f0',
        encode: {
          x: 'time',
          y: 'free',
        },
        emphasis: {
          focus: 'series',
        },
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0.5, width: 1 },
        areaStyle: { opacity: 0.85 },
      },
      {
        name: '其他',
        type: 'line',
        stack: 'Total',
        encode: {
          x: 'time',
          y: 'other',
        },
        color: '#ad4e00',
        emphasis: {
          focus: 'series',
        },
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0.5, width: 1 },
        areaStyle: { opacity: 0.85 },
      },
    ],
  }
}

export const UsageSeriesChart = (props: UsageSeriesProps) => {
  const op = useMemo(() => genUsageOp(props.data), [props.data])
  return (
    <ReactEChartsCore
      echarts={echarts}
      className={classNames('aiui-usageChart', props.className)}
      option={op}
      style={{ height: props.height }}
      theme={props.theme ?? 'light'}
    />
  )
}

// 外部用户的用量图

const genExternalUsageOp = (data: NodeUsageSeriesResult) => {
  return {
    tooltip: {
      trigger: 'axis',
    },
    animation: false,
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      containLabel: false,
    },
    xAxis: [
      {
        type: 'time',
        boundaryGap: false,
      },
    ],
    yAxis: [
      {
        type: 'value',
        max: (value: any) => Math.max(value.max, 1000),
        // splitLine: { show: false },
      },
    ],

    dataset: { source: data },
    series: [
      {
        name: '工作中',
        type: 'line',
        stack: 'Total',
        encode: {
          x: 'time',
          y: 'working',
        },

        color: '#238551',

        emphasis: {
          focus: 'series',
        },
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0.5, width: 1 },
        areaStyle: { opacity: 0.85 },
      },
      {
        name: '空闲/调度中',
        type: 'line',
        stack: 'Total',
        color: '#4c90f0',
        encode: {
          x: 'time',
          y: 'free',
        },
        emphasis: {
          focus: 'series',
        },
        itemStyle: { opacity: 0 },
        lineStyle: { opacity: 0, width: 1 },
        areaStyle: { opacity: 0.85 },
      },
    ],
  }
}

export const UsageSeriesExternalChart = (props: UsageSeriesProps) => {
  const op = useMemo(() => genExternalUsageOp(props.data), [props.data])
  return (
    <ReactEChartsCore
      echarts={echarts}
      className={classNames('aiui-usageChart', props.className)}
      option={op}
      style={{ height: props.height }}
      theme={props.theme ?? 'light'}
    />
  )
}
