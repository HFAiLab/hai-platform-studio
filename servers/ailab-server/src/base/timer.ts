import { FetalErrorTypes, serverMonitor } from '../monitor'
import { logger } from './logger'
import { globalIntervalMetrics, globalTimeoutMetrics } from './metrics'

const TimerTagMap = new Map()

/**
 * 带有一定监控能力的定时器
 * 对于 setTimeout 我们只记录调用次数
 * 对于 setInterval 我们记录保持的记录数目
 */
export class Timer {
  static setTimeout(callback: (args: void) => void, ms?: number, tag?: string): NodeJS.Timer {
    if (!tag) {
      logger.warn('call Timer without tag')
      return setTimeout(callback, ms)
    }

    const timeoutId = setTimeout(callback, ms)
    globalTimeoutMetrics.inc({ tag }, 1)
    return timeoutId
  }

  static clearTimeout(id: NodeJS.Timeout) {
    return clearTimeout(id)
  }

  static setInterval(callback: (args: void) => void, ms?: number, tag?: string): NodeJS.Timer {
    if (!tag) {
      logger.warn('call Timer without tag')
      return setInterval(callback, ms)
    }

    const intervalId = setInterval(callback, ms)
    if (TimerTagMap.has(intervalId)) {
      logger.error(`unreachable error: TimerTagMap has intervalId: ${intervalId}`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.unreachableError,
        content: 'TimerTagMap has intervalId',
      })
      return intervalId
    }
    TimerTagMap.set(intervalId, {
      tag,
    })
    globalIntervalMetrics.inc({ tag }, 1)
    return intervalId
  }

  static clearInterval(timerId: NodeJS.Timer) {
    if (TimerTagMap.has(timerId)) {
      const timerInfo = TimerTagMap.get(timerId)!
      globalIntervalMetrics.dec({ tag: timerInfo.tag }, 1)
      TimerTagMap.delete(timerId)
    } else {
      logger.warn('timerId not in TimerTagMap')
    }

    return clearInterval(timerId)
  }
}
