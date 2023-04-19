import { cloneDeep } from 'lodash-es'
import type { AlignedData } from 'uplot'
import { pwr2Util } from '../../../../utils'
import type { PerfQueryType } from '../ChartBlock'
// 获取序列，整理成串
// const URL_SERIES = '/task_perf_series_api_demo'

export type TaskTsObj = {
  start: number
  end: number
  series: Array<Array<any>>
  id: string | number
  rank: number
  type: PerfQueryType
  node?: string
}

export type ChainMeta = {
  name: string
  worker: number
  chainId: string
}

export type Ranges = Array<{
  startIdx: number
  endIdx: number
  node?: string
  id?: number | string
  rank?: number
}>

export function rebuildData(list: Array<TaskTsObj>, continuous = false): [AlignedData, Ranges] {
  const all_res: any[] = []
  const ranges: Ranges = []

  let totalTime = 0
  let lastRange = -1

  const defaultEmptySeries = {
    gpu: new Array(5).fill([]),
    cpu: new Array(4).fill([]),
    mem: new Array(4).fill([]),
    every_card: new Array(9).fill([]), // 9 个，1 个时间 8 个卡
    every_card_power: new Array(9).fill([]), // 9 个，1 个时间 8 个卡
    every_card_mem: new Array(9).fill([]), // 9 个，1 个时间 8 个卡
  } as any

  for (const t of list) {
    let series = cloneDeep(t.series ?? defaultEmptySeries[t.type]) as Array<Array<any>>

    // 复制一行功率来做 功率-> 使用率 曲线
    // 暂时没找到 uplot 复用数据画线的方法
    if (t.type === 'gpu') {
      series.push(series[series.length - 1]!.map((v) => pwr2Util(v)))
    }
    // 纳秒时间戳->秒时间戳
    series[0] = series[0]!.map((i) => Math.floor(i / 10e8))

    // 处理掉时间小于开始时间的点
    let idxToSlice = 0
    for (let len = series[0].length; idxToSlice < len; idxToSlice += 1) {
      if (series[0][idxToSlice] >= t.start) {
        break
      }
    }
    if (idxToSlice > 0) {
      series = series.map((i) => i.slice(idxToSlice))
    }

    // 开头和结尾塞入 null
    series[0]!.unshift(Math.floor(t.start))
    series[0]!.push(Math.floor(t.end))
    for (let i = 1; i < series.length; i += 1) {
      series[i]!.unshift(null)
      series[i]!.push(null)
    }
    // 塞入range
    const startIdx: number = lastRange + 1
    const endIdx: number = startIdx + series[0]!.length - 1
    ranges.push({ startIdx, endIdx, node: t.node!, id: t.id, rank: t.rank })
    lastRange = endIdx

    // 计算总用时，根据是否是continuous放入series中
    const first_ts = Math.floor(t.start)
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    const totalEspTime = series[0]!.map((i) => (totalTime + (i - first_ts)) / 3600)
    totalTime += Math.floor(t.end - t.start) + 1

    if (continuous) {
      series.push([...series[0]!]) // 最后一行记录真实时间
      series[0] = totalEspTime
    } else {
      series.push(totalEspTime)
    }

    // 放到 all_res 中
    for (let i = 0; i < series.length; i += 1) {
      all_res[i] = [...(all_res[i] || []), ...series[i]!]
    }
  }
  return [all_res as AlignedData, ranges]
}
