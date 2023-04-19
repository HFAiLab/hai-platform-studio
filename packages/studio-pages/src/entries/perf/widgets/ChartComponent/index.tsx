import React, { useEffect, useLayoutEffect, useRef } from 'react'
import uPlot from 'uplot'
import type { PerfQueryType } from '../ChartBlock'
import type { TaskTsObj } from './_data_factory'
import { rebuildData } from './_data_factory'
import type { IMem } from './_option'
import {
  hooksFactory,
  settingForCpuIo,
  settingForEveryCard,
  settingForEveryCardMem,
  settingForEveryCardPower,
  settingForGpu,
  settingForMemory,
} from './_option'

type UChartWrapperProps = {
  toDisplay: PerfQueryType
  data: Array<TaskTsObj>
  height: number
  width: number
  continuous: boolean
  currentTheme?: string
  labelMemory: IMem
  setLabelMemory(d: IMem): void
}

export type AlignedData = uPlot.AlignedData

const sizeGap = { width: 0, height: 0 }

export const UChartWrapper: React.FC<UChartWrapperProps> = ({
  toDisplay,
  height,
  width,
  data,
  continuous,
  currentTheme,
  labelMemory,
  setLabelMemory,
}) => {
  const uplotInstanceRef = useRef<uPlot | null>(null)
  const uplotRef = useRef(null)

  useLayoutEffect(() => {
    const [alignedData, range] = rebuildData(data, continuous)
    let opt = null
    const settingsMap = {
      gpu: settingForGpu,
      cpu: settingForCpuIo,
      every_card: settingForEveryCard,
      every_card_power: settingForEveryCardPower,
      every_card_mem: settingForEveryCardMem,
      mem: settingForMemory,
    }
    opt = {
      ...settingsMap[toDisplay](labelMemory),
      width: width ? width - sizeGap.width : 400,
      height: height ? height - sizeGap.height : 400,
      hooks: hooksFactory(range, continuous),
    }
    if (continuous) {
      opt.series[0] = {
        ...opt.series[0],
        label: 'Elapsed',
        scale: 'x',
        value: (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} h`),
      }
      opt = { ...opt, scales: { x: { time: false } } }
    }

    const el = uplotRef.current
    if (uplotInstanceRef.current) {
      uplotInstanceRef.current.destroy()
    }
    const instance = new uPlot(opt as any, alignedData as unknown as AlignedData, el!)
    uplotInstanceRef.current = instance

    // clean up
    return () => {
      if (uplotInstanceRef.current) {
        uplotInstanceRef.current.destroy()
      }
    }
  }, [toDisplay, continuous, data, currentTheme]) // 因为option需要使用range的信息，所以data或者range更新后，需要销毁chart实例重新设置

  // update size
  useEffect(() => {
    const instance = uplotInstanceRef.current
    if (instance) {
      instance.setSize({
        width: width ? width - sizeGap.width : 400,
        height: height ? height - sizeGap.height : 400,
      })
    }
  }, [width, height, uplotInstanceRef.current])

  // 检查是否开关过曲线
  const handleSeriesClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let el = e.target as HTMLElement | null
    let seriesEl
    while (el && el !== uplotRef.current) {
      if (el.tagName == 'TR' && el.classList.contains('u-series')) {
        seriesEl = el
        break
      } else {
        el = el.parentElement
      }
    }
    if (seriesEl) {
      const label = seriesEl.querySelector('.u-label')?.textContent
      const enabled = !seriesEl.classList.contains('u-off')
      if (!label) {
        return
      }
      const temp = {} as { [name: string]: boolean }
      temp[label] = enabled
      setLabelMemory({ ...labelMemory, ...temp })
    }
  }

  return <div className="chart-container" ref={uplotRef} onClick={handleSeriesClick} />
}
