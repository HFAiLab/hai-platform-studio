import filesize from 'filesize'
import { dayjs } from './dayjs'

/**
 * 格式化字节数
 */
export const formatBytes = filesize.partial({ base: 2 })

/**
 * 外部用户名后缀
 */
const EXTERNAL_USERNAME_SUFFIX = '*'
/**
 * 格式化外部用户名
 */
export const formatExternalUsername = (username: string): string =>
  `${username}${EXTERNAL_USERNAME_SUFFIX}`

/**
 * 格式化路径展示
 */
export const formatDisplayPath = (path: string): string => {
  return path.split('/').pop() ?? path
}

/**
 * 格式化百分比展示
 */
export const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`

/**
 * 格式化任务时长展示
 */
export const formatTaskAge = (time: dayjs.Dayjs): string => {
  const diffMSeconds = dayjs().diff(time)
  const diffDuration = dayjs.duration(diffMSeconds)

  if (diffMSeconds - dayjs.duration(1, 's').asMilliseconds() < 0) return 'now'
  if (diffMSeconds - dayjs.duration(1, 'm').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asSeconds())}s`
  if (diffMSeconds - dayjs.duration(10, 'm').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asMinutes())}m${diffDuration.get('seconds')}s`
  if (diffMSeconds - dayjs.duration(1, 'h').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asMinutes())}m`
  if (diffMSeconds - dayjs.duration(10, 'h').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asHours())}h${diffDuration.get('minutes')}m`
  if (diffMSeconds - dayjs.duration(1, 'd').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asHours())}h`
  if (diffMSeconds - dayjs.duration(10, 'd').asMilliseconds() < 0)
    return `${Math.floor(diffDuration.asDays())}d${diffDuration.get('hours')}h`
  return `${Math.floor(diffDuration.asDays())}d`
}
