import assert from 'assert'
import dayjs from 'dayjs'

// 接受天数 N 和日期字符串 YYYYMMDDHH 作为参数，并返回包括该日期之前的 N 天的日期字符串数组，不包括该日期本身
export function getHoursBeforeNHours(N: number, timeStr: string): string[] {
  const hours: string[] = []
  const startDate = dayjs(timeStr, 'YYYYMMDDHH')

  for (let i = 1; i <= N; i += 1) {
    const currentHour = new Date(startDate.valueOf() - i * 60 * 60 * 1000)
    const year = currentHour.getFullYear()
    const month = (currentHour.getMonth() + 1).toString().padStart(2, '0')
    const date = currentHour.getDate().toString().padStart(2, '0')
    const hour = currentHour.getHours().toString().padStart(2, '0')
    hours.push(`${year}${month}${date}${hour}`)
  }

  return hours.reverse() // 翻转数组顺序
}

// 接受天数 N 和日期字符串 YYYYMMDD 作为参数，并返回包括该日期之前的 N 天的日期字符串数组，不包括该日期本身
export function getDatesBeforeNDays(N: number, dateStr: string): string[] {
  const dates: string[] = []
  const startDate = dayjs(dateStr, 'YYYYMMDD')

  for (let i = 1; i < N; i += 1) {
    const currentDate = new Date(startDate.valueOf() - i * 24 * 60 * 60 * 1000)
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const date = currentDate.getDate().toString().padStart(2, '0')
    dates.push(`${year}${month}${date}`)
  }

  return dates.reverse() // 翻转数组顺序
}

// 接受周数 N 和日期字符串 YYYYMMDD 作为参数，并返回该日期之前，不包括本周的 N 周的每周一的字符串数组
export function getMondaysBeforeNWeeks(N: number, dateStr: string): string[] {
  const mondays: string[] = []
  const startDate = dayjs(dateStr, 'YYYYMMDD')

  for (let i = 1; i <= N; i += 1) {
    const currentMonday = new Date(startDate.valueOf() - i * 7 * 24 * 60 * 60 * 1000)
    currentMonday.setDate(currentMonday.getDate() - currentMonday.getDay() + 1) // 获取本周一的日期
    const year = currentMonday.getFullYear()
    const month = (currentMonday.getMonth() + 1).toString().padStart(2, '0')
    const date = currentMonday.getDate().toString().padStart(2, '0')
    mondays.push(`${year}${month}${date}`)
  }

  return mondays.reverse() // 翻转数组顺序
}

// 接受月数 N 和日期字符串 YYYYMM 作为参数，并返回该日期之前的 N 个月的 YYYYMM 字符串数组，不包括本月
export function getMonthsBeforeNMonths(N: number, dateStr: string): string[] {
  const months: string[] = []
  const startDate = dayjs(dateStr, 'YYYYMM')

  for (let i = 1; i <= N; i += 1) {
    const currentMonth = new Date(startDate.valueOf() - i * 30 * 24 * 60 * 60 * 1000) // 假设每个月都是 30 天
    const year = currentMonth.getFullYear()
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0')
    months.push(`${year}${month}`)
  }

  return months.reverse() // 翻转数组顺序
}

export function getDatePoints(
  range: 'daily' | 'monthly' | 'realtime' | 'weekly',
  dateStr: string,
  count: number,
) {
  switch (range) {
    case 'realtime':
      assert(/\d{10}/g.test(dateStr))
      return getHoursBeforeNHours(count, dateStr)
    case 'daily':
      assert(/\d{8}/g.test(dateStr))
      return getDatesBeforeNDays(count, dateStr)
    case 'weekly':
      assert(/\d{8}/g.test(dateStr))
      return getMondaysBeforeNWeeks(count, dateStr)
    case 'monthly':
      assert(/\d{6}/g.test(dateStr))
      return getMonthsBeforeNMonths(count, dateStr)
    default:
      return []
  }
}
