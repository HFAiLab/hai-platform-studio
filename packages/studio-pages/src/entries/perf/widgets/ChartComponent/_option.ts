import dayjs from 'dayjs'
import type uPlot from 'uplot'
import type { Ranges } from './_data_factory'

const colorPalette = [
  '#f9c98f',
  '#a3bba9',
  '#d7ab82',
  '#abc9e4',
  '#61a0a8',
  '#efa18d',
  '#787464',
  '#cc7e63',
  '#724e58',
  '#4b565b',
] as const

const colorPaletteBg = ['#FFC931', '#01A9DA']

/**
 * Must adapt both dark theme and light theme.
 */
const STROKE_COLOR_LIGHT_GRID = '#DDD'
const STROKE_COLOR_LIGHT_LABEL = '#555'
const STROKE_COLOR_DARK_GRID = '#333'
const STROKE_COLOR_DARK_LABEL = '#AAA'

/**
 * Check dark theme.
 */
const isDarkTheme = (): boolean => {
  return Boolean(document.querySelector('body[data-jp-theme-light="false"]'))
}
const getStrokeColor = (): { grid: string; label: string } => {
  return isDarkTheme()
    ? { grid: STROKE_COLOR_DARK_GRID, label: STROKE_COLOR_DARK_LABEL }
    : { grid: STROKE_COLOR_LIGHT_GRID, label: STROKE_COLOR_LIGHT_LABEL }
}

export interface IMem {
  [name: string]: boolean
}

export const hooksFactory = (range: Ranges, continuous = false) => {
  const shiftX = 10
  const shiftY = 10

  class Tooltip {
    constructor(u: uPlot) {
      this.uPlotInstance = u
      this.leftOffset = 0
      this.topOffset = 0
      this.seriesIdx = 0
      this.dataIdx = 0
      this.el = document.createElement('div')
      this.el.className = 'u-tooltip'
      this.visible = false
      this.overEl = u.root.querySelector('.u-over') as HTMLDivElement
      this.leftOffset = parseFloat(this.overEl.style.left)
      this.topOffset = parseFloat(this.overEl.style.top)
      u.root.querySelector('.u-wrap')!.appendChild(this.el)
    }

    show() {
      if (!this.visible) {
        this.el.style.display = 'block'
        this.visible = true
      }
    }

    hide() {
      if (this.visible) {
        this.el.style.display = 'none'
        this.visible = false
      }
    }

    set() {
      const u = this.uPlotInstance
      this.show()
      const top = this.cursorTop ?? 0
      const left = u.valToPos(u.data[0]![this.dataIdx!]!, 'x')

      // 避免移到屏幕外面
      const totalHeight = u.height
      const elHeight = this.el.clientHeight
      const calcedTop = this.topOffset + top + shiftY
      this.el.style.top = `${
        calcedTop + elHeight > totalHeight ? totalHeight - elHeight : calcedTop
      }px`

      const totalWidth = u.width
      const elWidth = this.el.clientWidth
      const calcedLeft = this.leftOffset + left + shiftX
      this.el.style.left = `${
        calcedLeft + elWidth > totalWidth ? calcedLeft - elWidth - 2 * shiftX : calcedLeft
      }px`
      const dateStr = continuous
        ? `RealTime: ${dayjs(
            ((u.data[(u.data.length - 1) as any] as any)[this.dataIdx || 0] ?? 0) * 1000,
          ).format('YY-MM-DD HH:mm:ss')}`
        : `Elapsed: ${u.data[(u.data.length - 1) as any]![this.dataIdx || 0]!.toFixed(1)} h`
      const selectedRange = range.filter(
        (item) => item.startIdx <= this.dataIdx! && item.endIdx >= this.dataIdx!,
      )[0]
      const nodeStr = `node: ${selectedRange?.node ?? 'UNKNOWN'}`
      const rankStr = `rank: ${selectedRange?.rank ?? 'UNKNOWN'}`
      const idStr = `Task Id: ${selectedRange?.id ?? 'UNKNOWN'}`

      // 把其他 series 里面的抽出来
      const otherValues = ['------------']
      u.series.forEach((s, idx) => {
        if (idx === 0) {
          return
        }
        const v = u.data[idx]![this.dataIdx!]!
        const k = s.label ?? 'unknown_column'
        otherValues.push(
          `${k}: ${typeof s.value === 'function' ? s.value!(u, v as number, 0, 0) : v}`,
        )
      })
      this.el.textContent = `${dateStr}\n${idStr}\n${rankStr}\n${nodeStr}\n${otherValues.join(
        '\n',
      )}`
    }

    setTop(cursorTop: number) {
      this.cursorTop = cursorTop
    }

    leftOffset: number

    topOffset: number

    visible: boolean

    el: HTMLDivElement

    overEl: HTMLDivElement

    uPlotInstance: uPlot

    seriesIdx: number | undefined | null

    dataIdx: number | undefined | null

    cursorTop: number | undefined
  }
  let tooltip: Tooltip
  return {
    ready: [
      (u: uPlot) => {
        tooltip = new Tooltip(u)
      },
    ],
    setCursor: [
      (u: uPlot) => {
        if (tooltip) {
          const c = u.cursor

          tooltip.dataIdx = c.idx
          if (!c.idx && c.idx !== 0) {
            tooltip.hide()
          } else {
            tooltip.setTop(c.top!)
            tooltip.set()
          }
        }
      },
    ],
    setSeries: [
      (u: uPlot, sIdx: number) => {
        if (tooltip) {
          if (tooltip.seriesIdx !== sIdx) {
            tooltip.seriesIdx = sIdx
            if (sIdx == null) {
              tooltip.hide()
            } else if (tooltip.dataIdx != null) {
              tooltip.set()
            }
          }
        }
      },
    ],
    drawAxes: [
      (u: uPlot) => {
        const { ctx } = u
        const { top, height, left, width } = u.bbox
        ctx.save()

        if (!u.series || !u.series[0] || !range) {
          return
        }
        const [iMin, iMax] = u.series[0].idxs as unknown as [number, number]
        for (const idx in range) {
          const r = range[idx]!
          if (r.endIdx < iMin || r.startIdx > iMax) {
            // eslint-disable-next-line no-continue
            continue
          }
          const leftSide = Math.max(r.startIdx, iMin)
          const rightSide = Math.min(r.endIdx, iMax)
          const ctxLeft =
            leftSide === iMin ? left : Math.round(u.valToPos(u.data[0][leftSide]!, 'x', true))
          const ctxRight =
            rightSide === iMax
              ? left + width
              : Math.round(u.valToPos(u.data[0][rightSide]!, 'x', true))
          const rectWidth = ctxRight - ctxLeft
          const rectHeight = height
          ctx.fillStyle = `${colorPaletteBg[Number(idx) % colorPaletteBg.length]}20`
          ctx.fillRect(ctxLeft, top, rectWidth, rectHeight)
        }
        ctx.restore()
      },
    ],
  }
}

export const settingForGpu = (memory: IMem): uPlot.Options => {
  const strokeColor = getStrokeColor()
  const value = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} %`)
  const valuePower = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(0)} W`)
  const valueMiB = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} MiB`)
  return {
    width: 0,
    height: 0,
    series: [
      {
        stroke: strokeColor.label,
      },
      {
        label: 'GPU Util',
        scale: '%',
        value,
        stroke: colorPalette[4],
        width: 2,
        show: memory['GPU Util'] ?? true,
      },
      {
        label: 'GPU MEM',
        scale: 'MiB',
        value: valueMiB,
        stroke: colorPalette[2],
        width: 2,
        show: memory['GPU MEM'] ?? true,
      },
      {
        label: 'GPU Power',
        scale: 'W',
        value: valuePower,
        stroke: colorPalette[6],
        width: 2,
        // show: memory['GPU Power'] ?? true,
        show: false,
      },
      {
        label: 'GPU PowerToUtil',
        scale: '%',
        value,
        stroke: colorPalette[1],
        width: 2,
        show: memory['GPU PowerToUtil'] ?? true,
      },
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        side: 3,
        scale: '%',
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(1)} %`),
        size: 60, // It's width
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        side: 1,
        scale: 'MiB',
        size: 100, // It's width
        stroke: strokeColor.label,
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(0)} MiB`),
        grid: { show: false },
      },
      {
        side: 3,
        scale: 'W',
        size: 60, // It's width
        stroke: strokeColor.label,
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(0)} W`),
        grid: { show: false },
      },
    ],
  }
}

export const settingForMemory = (memory: IMem): uPlot.Options => {
  const strokeColor = getStrokeColor()
  const value = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(2)} GiB`)
  return {
    width: 0,
    height: 0,

    series: [
      {
        stroke: strokeColor.label,
      },
      {
        label: 'RSS',
        scale: 'GiB',
        value,
        stroke: colorPalette[2],
        fill: `${colorPalette[2]}30`,
        width: 2,
        show: memory.RSS ?? true,
      },
      {
        label: 'RSS + Cache',
        scale: 'GiB',
        value,
        stroke: colorPalette[3],
        fill: `${colorPalette[3]}30`,
        width: 2,
        show: memory['RSS + Cache'] ?? true,
      },
      {
        label: 'Limit',
        scale: 'GiB',
        value,
        stroke: colorPalette[4],
        points: { show: false },
        width: 2,
        show: memory.Limit ?? true,
      },
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        scale: 'GiB',
        size: 100, // It's width
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(2)} GiB`),
        grid: { show: false },
        stroke: strokeColor.label,
      },
    ],
  }
}

export const settingForCpuIo = (memory: IMem): uPlot.Options => {
  const strokeColor = getStrokeColor()
  const valueGiB = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} GiB`)
  return {
    width: 0,
    height: 0,
    series: [
      {
        stroke: strokeColor.label,
      },
      {
        label: 'CPU',
        scale: 'Cores',
        value: (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} C`),
        stroke: colorPalette[2],
        width: 2,
        show: memory.CPU ?? true,
      },
      {
        label: 'IB Rx/s',
        scale: 'GiB',
        value: valueGiB,
        stroke: colorPalette[3],
        width: 2,
        show: memory['IB Rx/s'] ?? true,
      },
      {
        label: 'IB Tx/s',
        scale: 'GiB',
        value: valueGiB,
        stroke: colorPalette[4],
        width: 2,
        show: memory['IB Tx/s'] ?? true,
      },
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        scale: 'Cores',
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(1)} Cores`),
        size: 100, // It's width
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        side: 1,
        scale: 'GiB/s',
        size: 100, // It's width
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(1)} GiB/s`),
        grid: { show: false },
        stroke: strokeColor.label,
      },
    ],
  }
}

export const settingForEveryCard = (memory: IMem) => {
  const strokeColor = getStrokeColor()
  const value = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)}%`)
  return {
    width: 600,
    height: 600,
    series: [
      {
        stroke: strokeColor.label,
      },
      ...Array.from(new Uint8Array(8), (v, idx) => {
        return {
          label: `Gpu${idx}`,
          scale: '%',
          value,
          stroke: colorPalette[idx % colorPalette.length],
          width: 1,
          show: memory[`Gpu${idx}`] ?? true,
        }
      }),
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        scale: '%',
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(1)} %`),
        size: 100, // It's width
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
    ],
  }
}

export const settingForEveryCardPower = (memory: IMem) => {
  const valueW = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} W`)
  const strokeColor = getStrokeColor()
  return {
    width: 600,
    height: 600,
    series: [
      {
        stroke: strokeColor.label,
      },
      ...Array.from(new Uint8Array(8), (v, idx) => {
        return {
          label: `Gpu${idx} Power`,
          scale: 'W',
          value: valueW,
          stroke: colorPalette[idx % colorPalette.length],
          width: 1,
          show: memory[`Gpu${idx} Power`] ?? true,
        }
      }),
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        scale: 'W',
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(0)} W`),
        size: 100, // It's width
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
    ],
  }
}

export const settingForEveryCardMem = (memory: IMem) => {
  const valueMiB = (u: unknown, v: number) => (v == null ? '-' : `${v.toFixed(1)} MiB`)
  const strokeColor = getStrokeColor()
  return {
    width: 600,
    height: 600,
    series: [
      {
        stroke: strokeColor.label,
      },
      ...Array.from(new Uint8Array(8), (v, idx) => {
        return {
          label: `Gpu${idx} MEM`,
          scale: 'MiB',
          value: valueMiB,
          stroke: colorPalette[idx % colorPalette.length],
          width: 1,
          show: memory[`Gpu${idx} MEM`] ?? true,
        }
      }),
    ],
    axes: [
      {
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
      {
        scale: 'MiB',
        values: (u: unknown, vals: number[]) => vals.map((v) => `${+v.toFixed(0)} MiB`),
        size: 100, // It's width
        stroke: strokeColor.label,
        grid: {
          stroke: strokeColor.grid,
          width: 1,
        },
      },
    ],
  }
}
