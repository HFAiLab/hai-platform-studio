/* eslint-disable @typescript-eslint/no-unused-vars */
import type { TaskCurrentPerfStat } from '@hai-platform/client-ailab-server'
import type { TaskConfigJsonTraining, TaskNodesContainerMonitorStat } from '@hai-platform/shared'
import { TaskChainStatus, isCPUGroup, isHalfTask } from '@hai-platform/shared'
import { bytesToDisplay } from '@hai-platform/studio-toolkit/lib/esm/utils/convert'
import type { Chain } from '../../../../../model/Chain'
import { pwr2Util } from '../../../../../utils'

export interface CustomTrainingsSingleConfig {
  className: string
  name: string
  title?: string
  dynClassName?: (value: number | null | undefined, chain: Chain) => string
  tooltip?: string
}

export const CustomTrainingsConfig: Required<{
  [key in keyof TaskCurrentPerfStat]: CustomTrainingsSingleConfig
}> = {
  cpu: {
    className: 'cpu',
    name: 'CPU',
    title: '任务运行节点 CPU 占用率近 5 分钟均值（运行一段时间才有数据）',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) return 'err'
      if (value && value < 30) return 'low'
      if (value && value > 85) return 'high'
      return ''
    },
  },
  mem: {
    className: 'mem',
    name: 'Memory',
    title: '任务运行节点 Memory 占用近 5 分钟均值（运行一段时间才有数据）',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) return 'err'
      return ''
    },
  },
  gpu_util: {
    className: 'gpuu',
    title: '任务运行节点 GPU 占用率均值',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) {
        if (isCPUGroup(chain.group)) return ''
        return 'err'
      }
      if (value && value < 30) return 'low'
      if (value && value > 85) return 'high'
      return ''
    },
    name: 'GPU',
  },
  gpu_power: {
    className: 'gpup',
    title: '任务运行节点 GPU 功耗均值',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) {
        if (isCPUGroup(chain.group)) return ''
        return 'err'
      }
      // 这两个值是通过下面的 30,85 算出来的
      if (value && value < 117) return 'low'
      if (value && value > 221.5) return 'high'
      return ''
    },
    name: 'G Pwr',
  },
  gpu_p2u: {
    className: 'gpu_p2u',
    tooltip:
      'GPU Power -> Util, 使用功耗折算 GPU 的实际使用率，如果与标称使用率差距过大，' +
      '\n请检查任务是否卡住',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) {
        if (isCPUGroup(chain.group)) return ''
        return 'err'
      }
      const converted = pwr2Util(value)
      if (converted && converted < 30) return 'low'
      if (converted && converted > 85) return 'high'
      return ''
    },
    name: 'GP->U',
  },
  ib_rx: {
    className: 'ibr',
    title: 'Average data received by RDMA device per second per node',
    name: 'IB Rx/s',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) return 'err'
      return ''
    },
  },
  ib_tx: {
    className: 'ibt',
    title: 'Average data sends by RDMA device per second per node',
    name: 'IB Tx/s',
    dynClassName: (value: number | null | undefined, chain: Chain): string => {
      if (value === -1) return 'err'
      return ''
    },
  },
}

export type FormattedPerfData = Required<{
  [key in keyof TaskCurrentPerfStat]: {
    title: string
    avg: number | null
    formatted: string
  }
}>

/**
 * 获取到平均值，以及 title，用于格式化后端返回的数据
 */
export const FormatPerfData = (
  perfs: TaskCurrentPerfStat,
  chain: Chain,
): Partial<FormattedPerfData> => {
  const res: Partial<FormattedPerfData> = {}

  // 对于正在运行的 cpu 半个节点的任务，部分性能字段获取不到，特殊处理：
  const isCPUHalfAndRunning =
    chain.chain_status === TaskChainStatus.RUNNING &&
    isCPUGroup((chain.config_json as TaskConfigJsonTraining).client_group || '') &&
    isHalfTask((chain.config_json as TaskConfigJsonTraining).client_group || '')

  const formatKeyValues = (
    keyValues: TaskNodesContainerMonitorStat,
    options: {
      formatter: (value: number | null | undefined) => string
    },
  ) => {
    let total = -1
    let title = ''
    let countIndex = 0
    const eachSize = 4
    for (const [key, value] of Object.entries(keyValues)) {
      const currentTitle = `${key}:${options.formatter(value)}`.padEnd(30, ' ')
      title += currentTitle
      if (countIndex !== 0 && (countIndex + 1) % eachSize === 0) title += '\n'

      if (typeof value !== 'number' || value === -1) {
        continue
      }

      if (total === -1) total = 0

      total += value
      countIndex += 1
    }

    // eslint-disable-next-line no-nested-ternary
    const avg = countIndex === 0 ? (total === -1 ? -1 : null) : total / countIndex
    const formatted = options.formatter(avg)

    return {
      title,
      avg,
      formatted,
    }
  }

  // hint: 这个各个都不太一样，不强求复用了
  const percentFormatter = (val: number | undefined | null) => {
    if (val === -1) return 'ERR'
    return val === null || val === undefined ? 'loading' : `${val.toFixed(1)}%`
  }

  const percentFormatterGPU = (val: number | undefined | null) => {
    if (val === -1) {
      if (isCPUGroup(chain.group)) return ''
      return 'ERR'
    }

    return val === null || val === undefined ? 'loading' : `${val.toFixed(1)}%`
  }
  const percentFormatterPwr2U = (val: number | undefined | null) => {
    if (val === -1) {
      if (isCPUGroup(chain.group)) return ''
      return 'ERR'
    }
    const converted = pwr2Util(val)

    return converted === null || converted === undefined ? 'loading' : `${converted.toFixed(1)}%`
  }
  const powerFormatter = (val: number | undefined | null) => {
    if (val === -1) return 'ERR'
    return val === null || val === undefined ? 'loading' : `${val.toFixed(0)}W`
  }

  const bytesFormatter = (val: number | undefined | null) => {
    if (val === -1) return 'ERR'
    return val === null || val === undefined ? 'loading' : bytesToDisplay(val, 2, true)
  }

  const ibBytesFormatter = (val: number | undefined | null) => {
    if (val === -1) return isCPUHalfAndRunning ? '*' : 'ERR'
    return val === null || val === undefined
      ? 'loading'
      : bytesToDisplay(val * 1024 * 1024 * 1024, 2, true)
  }

  if (perfs.cpu) {
    const { title, avg, formatted } = formatKeyValues(perfs.cpu, { formatter: percentFormatter })
    res.cpu = { title, avg, formatted }
  }

  if (perfs.mem) {
    const { title, avg, formatted } = formatKeyValues(perfs.mem, { formatter: bytesFormatter })
    res.mem = { title, avg, formatted }
  }

  if (perfs.gpu_util) {
    const { title, avg, formatted } = formatKeyValues(perfs.gpu_util, {
      formatter: percentFormatterGPU,
    })
    res.gpu_util = { title, avg, formatted }
  }
  if (perfs.gpu_power) {
    const { title, avg, formatted } = formatKeyValues(perfs.gpu_power, {
      formatter: powerFormatter,
    })
    res.gpu_power = { title, avg, formatted }
  }
  if (perfs.gpu_p2u) {
    const { title, avg, formatted } = formatKeyValues(perfs.gpu_p2u, {
      formatter: percentFormatterPwr2U,
    })
    res.gpu_p2u = { title, avg, formatted }
  }
  if (perfs.ib_rx) {
    const { title, avg, formatted } = formatKeyValues(perfs.ib_rx, {
      formatter: ibBytesFormatter,
    })
    res.ib_rx = { title, avg, formatted }
  }

  if (perfs.ib_tx) {
    const { title, avg, formatted } = formatKeyValues(perfs.ib_tx, {
      formatter: ibBytesFormatter,
    })
    res.ib_tx = { title, avg, formatted }
  }

  return res
}
