import dayjs from 'dayjs'
import objectSupport from 'dayjs/plugin/objectSupport'

dayjs.extend(objectSupport)

export const ONEDAY = 24 * 60 * 60 * 1000
export const ONEHOUR = 60 * 60 * 1000
export const ONEMINUTE = 60 * 1000
const DayUpdateHour = 3 // 3 点后我们认为数据已经统计出来了

const HourUpdateMinute = 3 // 3 分钟之后我们认为当前的数据已经统计出来了

export enum DatePeriod {
  realtime = 'realtime',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}

// hint: 虽然 report json 的命名是不带 - 的，但是带 - 的能够被 Date 解析出来，更具有兼容性
const DayFormats = {
  [DatePeriod.realtime]: 'YYYY-MM-DD HH',
  [DatePeriod.daily]: 'YYYY-MM-DD',
  [DatePeriod.weekly]: 'YYYY-MM-DD',
  [DatePeriod.monthly]: 'YYYY-MM',
}

/**
 * 获取之前 N 天
 * 如果是日的思路的话，就是当前 - 1 天毫秒数，是上一天
 * * */
export function getLastNDates(datePeriod: DatePeriod, n: number, from?: Date): dayjs.Dayjs[] {
  const now = from || new Date()
  const nowTimestamp = now.getTime()
  let begin: number
  let step: number
  if (datePeriod === DatePeriod.daily) {
    const hours = now.getHours()
    step = 1 * ONEDAY
    if (hours < DayUpdateHour) {
      // hint: 3 点之后就假设有数据了
      begin = nowTimestamp - 2 * ONEDAY
    } else {
      begin = nowTimestamp - 1 * ONEDAY
    }
  } else if (datePeriod === DatePeriod.weekly) {
    const hours = now.getHours()
    let weekDay = now.getDay() // 获取当前是星期几，0 代表星期日
    if (weekDay === 0) weekDay = 7
    step = 7 * ONEDAY

    if (hours < DayUpdateHour && weekDay === 1) {
      // 这个时候上周的数据还没有统计出来，应该是上上周的数据
      begin = nowTimestamp - (weekDay - 1) * ONEDAY - step * 2
    } else {
      begin = nowTimestamp - (weekDay - 1) * ONEDAY - step
    }
  } else if (datePeriod === DatePeriod.monthly) {
    const hours = now.getHours()
    let year = now.getFullYear()
    let month = now.getMonth()
    const monthDay = now.getDate()

    // 这里不能使用通用逻辑，因为每个月的天数不一样的
    if (hours < DayUpdateHour && monthDay === 1) {
      // 上个月还没出，要上上个月的
      month -= 2
      if (month < 0) {
        year -= 1
        month += 12
      }
    } else {
      month -= 1
      if (month < 0) {
        year -= 1
        month += 12
      }
    }
    const resDateList = [dayjs({ year, month })]
    let loop = n - 1
    while (loop > 0) {
      month -= 1
      if (month < 0) {
        year -= 1
        month += 12
      }
      resDateList.push(dayjs({ year, month }))
      loop -= 1
    }
    return resDateList
  } else if (datePeriod === DatePeriod.realtime) {
    const minute = now.getMinutes()
    let beginTime = nowTimestamp - ONEHOUR
    if (minute < HourUpdateMinute) beginTime -= ONEHOUR
    const resDateList = [dayjs(new Date(beginTime))]
    let loop = n - 1
    while (loop > 0) {
      beginTime -= ONEHOUR
      resDateList.push(dayjs(new Date(beginTime)))
      loop -= 1
    }
    return resDateList
  } else {
    return new Array(n).fill(null)
    // throw new Error('not impl')
  }

  const resDateList = [dayjs(begin)]
  let loop = n - 1
  while (loop > 0) {
    begin! -= step!
    resDateList.push(dayjs(begin))
    loop -= 1
  }
  return resDateList
}

export function getLastNDateStrings(dp: DatePeriod, n: number, from?: Date) {
  const dateList = getLastNDates(dp, n, from)
  return dateList.map((day) => {
    return day.format(DayFormats[dp])
  })
}

export function getLastDateStr(dp: DatePeriod, from?: Date) {
  return getLastNDateStrings(dp, 1, from)[0]
}
