import { Languages, i18n } from '@hai-platform/i18n'
import { DatePeriod } from '@hai-platform/shared'
import dayjs from 'dayjs'

export const convertDateStrToDisplay = (dateStr: string | null | undefined, period: DatePeriod) => {
  if (!dateStr) return ''
  if (period === DatePeriod.realtime) {
    return dateStr
  }
  if (period === DatePeriod.daily) {
    return dateStr
  }
  if (period === DatePeriod.weekly) {
    const begin = new Date(dateStr!)
    const end = begin.getTime() + 7 * 24 * 60 * 60 * 1000
    return `${dayjs(begin).format('YYYY-MM-DD')} - ${dayjs(end).format('YYYY-MM-DD')}`
  }
  if (period === DatePeriod.monthly) {
    return `${dateStr}`
  }

  return `${dateStr}`
}

/**
 * Convert Number to k : 2392 -> 2.4 k
 * @param v
 * @returns string
 */
export const numberToThousands = (v: number) => {
  if (v > 9999) {
    return `${(v / 1000).toFixed(1)}k`
  }
  return `${v}`
}
export const numberToWanOrThousands = (v: number, fixed = 2) => {
  const currentLang = i18n.currentLanguage
  if (currentLang === Languages.ZH_CN) {
    return v > 9999 ? `${(v / 10000).toFixed(fixed)} 万` : v.toFixed(fixed)
  }
  return v > 9999 ? `${(v / 1000).toFixed(fixed)} k` : v.toFixed(fixed)
}
