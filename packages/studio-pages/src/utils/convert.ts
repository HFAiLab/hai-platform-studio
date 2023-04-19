import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(relativeTime)

/**
 * Escape a file path to nb_name(experiment name)
 * @param path
 * @returns nb_name
 */
export const pathToNbName = (path: string): string => {
  return path.replace(/\//g, '_@_')
}

/**
 * Unescape a nb_name(experiment name) to file path
 * @param nbName
 * @returns nb_name
 */
export const nbNameToPath = (nbName: string): string => {
  return nbName.replace(/_@_/g, '/')
}

/**
 * Convert a UTC+8 time string(from server side) to local time
 * @param t a time string format 'YYYY-MM-DD HH:mm:ss...' or 'YYYY-MM-DDTHH:mm:ss...'
 * @returns 'YY-MM-DD HH:mm:ss' or 'YY-MM-DD HH:mm:ss.SSS'
 */
export const serverTimeToLocal = (t: string): string => {
  const normal = t.slice(0, 19)
  const remain = t.slice(19)
  return dayjs.tz(normal, 'Asia/Shanghai').local().format('YYYY-MM-DD HH:mm:ss') + remain
}

/**
 * Get a datetime string
 * @param d Date or string. if null, use current time.
 * @param short Hide "year"?
 * @returns Date string
 */
export const dateStr = (d?: Date | string | null, short?: boolean): string => {
  const useCST = Boolean((window as any).__UTC8TZ__)
  let fmt = short ? 'MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss'
  if (useCST) {
    fmt += ' (+8)'
  }
  const dateObj = d ? dayjs.tz(d, 'Asia/Shanghai') : dayjs()
  return useCST ? dateObj.format(fmt) : dateObj.local().format(fmt)
}
/**
 *
 */
export const chainInitial = (chain_id: string): string | null => {
  return chain_id?.split('-')[0] ?? null
}

/**
 * If node name like "xx-yyyy-zz ", just return "yyyy"
 * External user will show "hfai-rank-x"
 */
export const shortNodeName = (name?: string): string | null | undefined => {
  if (!name) {
    return null
  }
  const a = name.split('-')
  // eslint-disable-next-line no-nested-ternary
  return a.length === 3
    ? a[1] === 'rank'
      ? 'hfai' // External user
      : a[1]
    : name
}

export const relTime = (d: Date | number) => {
  return dayjs().to(dayjs(d))
}

/**
 * GPU 功率转换为使用率
 */
export const pwr2Util = (pwr: number | null | undefined) => {
  if (!pwr) {
    return pwr
  }
  if (pwr < 60) {
    return 0
  }
  const u = (pwr - 60) / 1.9
  return Math.min(u, 100)
}
