import { DatePeriod } from '@hai-platform/shared'
import { expect, test } from 'vitest'
import { getLastDateStr, getLastNDateStrings } from '../src/date/utils'

test('date-convert-test', async () => {
  console.log('call date-convert-test 2')

  // 普通的一天 0 点前和 0 点后，这一天是一个周日
  const beginMoreThan3 = new Date('2022-04-24 06:00:00')
  const beginLessThan3 = new Date('2022-04-24 01:00:00')

  const day1 = getLastDateStr(DatePeriod.daily, beginLessThan3)
  const day2 = getLastDateStr(DatePeriod.daily, beginMoreThan3)
  // console.log(`day1: ${day1}, day2: ${day2}`)

  expect(day1).toEqual('2022-04-22')
  expect(day2).toEqual('2022-04-23')

  const week1 = getLastDateStr(DatePeriod.weekly, beginLessThan3)
  const week2 = getLastDateStr(DatePeriod.weekly, beginMoreThan3)

  expect(week1).toEqual('2022-04-11')
  expect(week2).toEqual('2022-04-11')
  // console.log(`week1: ${week1}, week2: ${week2}`)

  const month1 = getLastDateStr(DatePeriod.monthly, beginLessThan3)
  const month2 = getLastDateStr(DatePeriod.monthly, beginMoreThan3)

  expect(month1).toEqual('2022-03')
  expect(month2).toEqual('2022-03')
  // console.log(`month1: ${month1}, month2: ${month2}`)

  // 周一的一天 0 点前和 0 点后
  const beginLessThan3W1 = new Date('2022-04-18 01:00:00')
  const beginMoreThan3W1 = new Date('2022-04-18 06:00:00')

  const day21 = getLastDateStr(DatePeriod.daily, beginLessThan3W1)
  const day22 = getLastDateStr(DatePeriod.daily, beginMoreThan3W1)

  const day21List1 = getLastNDateStrings(DatePeriod.daily, 10, beginLessThan3W1)
  const day22List2 = getLastNDateStrings(DatePeriod.daily, 10, beginMoreThan3W1)

  expect(day21).toEqual('2022-04-16')
  expect(day22).toEqual('2022-04-17')
  expect(day21List1).toEqual([
    '2022-04-16',
    '2022-04-15',
    '2022-04-14',
    '2022-04-13',
    '2022-04-12',
    '2022-04-11',
    '2022-04-10',
    '2022-04-09',
    '2022-04-08',
    '2022-04-07',
  ])
  expect(day22List2).toEqual([
    '2022-04-17',
    '2022-04-16',
    '2022-04-15',
    '2022-04-14',
    '2022-04-13',
    '2022-04-12',
    '2022-04-11',
    '2022-04-10',
    '2022-04-09',
    '2022-04-08',
  ])

  // console.log(`day21: ${day21}, day22: ${day22}`)
  // console.log(`day21List1: ${JSON.stringify(day21List1)}, day22List2: ${JSON.stringify(day22List2)}`)

  const week21 = getLastDateStr(DatePeriod.weekly, beginLessThan3W1)
  const week22 = getLastDateStr(DatePeriod.weekly, beginMoreThan3W1)

  const week21List1 = getLastNDateStrings(DatePeriod.weekly, 10, beginLessThan3W1)
  const week22List2 = getLastNDateStrings(DatePeriod.weekly, 10, beginMoreThan3W1)

  expect(week21).toEqual('2022-04-04')
  expect(week22).toEqual('2022-04-11')
  expect(week21List1).toEqual([
    '2022-04-04',
    '2022-03-28',
    '2022-03-21',
    '2022-03-14',
    '2022-03-07',
    '2022-02-28',
    '2022-02-21',
    '2022-02-14',
    '2022-02-07',
    '2022-01-31',
  ])
  expect(week22List2).toEqual([
    '2022-04-11',
    '2022-04-04',
    '2022-03-28',
    '2022-03-21',
    '2022-03-14',
    '2022-03-07',
    '2022-02-28',
    '2022-02-21',
    '2022-02-14',
    '2022-02-07',
  ])

  // console.log(`week21: ${week21}, week22: ${week22}`)
  // console.log(`week21List1: ${JSON.stringify(week21List1)}, week22List2: ${JSON.stringify(week22List2)}`)

  const month21 = getLastDateStr(DatePeriod.monthly, beginLessThan3W1)
  const month22 = getLastDateStr(DatePeriod.monthly, beginMoreThan3W1)

  const month21List1 = getLastNDateStrings(DatePeriod.monthly, 10, beginLessThan3W1)
  const month22List2 = getLastNDateStrings(DatePeriod.monthly, 10, beginMoreThan3W1)

  expect(month21).toEqual('2022-03')
  expect(month22).toEqual('2022-03')
  expect(month21List1).toEqual([
    '2022-03',
    '2022-02',
    '2022-01',
    '2021-12',
    '2021-11',
    '2021-10',
    '2021-09',
    '2021-08',
    '2021-07',
    '2021-06',
  ])
  expect(month22List2).toEqual([
    '2022-03',
    '2022-02',
    '2022-01',
    '2021-12',
    '2021-11',
    '2021-10',
    '2021-09',
    '2021-08',
    '2021-07',
    '2021-06',
  ])

  // console.log(`month21: ${month21}, month22: ${month22}`)
  // console.log(`month21List1: ${JSON.stringify(month21List1)}, month22List2: ${JSON.stringify(month22List2)}`)

  // 月的一天 0 点前和 0 点后
  const beginLessThan3M1 = new Date('2022-04-01 01:00:00')
  const beginMoreThan3M2 = new Date('2022-04-01 06:00:00')

  const day31 = getLastDateStr(DatePeriod.daily, beginLessThan3M1)
  const day32 = getLastDateStr(DatePeriod.daily, beginMoreThan3M2)

  expect(day31).toEqual('2022-03-30')
  expect(day32).toEqual('2022-03-31')
  // console.log(`day31: ${day31}, day22: ${day32}`)

  const week31 = getLastDateStr(DatePeriod.weekly, beginLessThan3M1)
  const week32 = getLastDateStr(DatePeriod.weekly, beginMoreThan3M2)
  expect(week31).toEqual('2022-03-21')
  expect(week32).toEqual('2022-03-21')
  // console.log(`week31: ${week31}, week32: ${week32}`)

  const month31 = getLastDateStr(DatePeriod.monthly, beginLessThan3M1)
  const month32 = getLastDateStr(DatePeriod.monthly, beginMoreThan3M2)
  expect(month31).toEqual('2022-02')
  expect(month32).toEqual('2022-03')
  // console.log(`month31: ${month31}, month32: ${month32}`)

  const beginMoreThan3W21 = new Date('2022-04-23 06:00:00')
  const beginLessThan3W22 = new Date('2022-04-23 01:00:00')

  const week41 = getLastDateStr(DatePeriod.weekly, beginMoreThan3W21)
  const week42 = getLastDateStr(DatePeriod.weekly, beginLessThan3W22)

  expect(week41).toEqual('2022-04-11')
  expect(week42).toEqual('2022-04-11')
  // console.log(`week41: ${week41}, week42: ${week42}`)

  const beginHourNormal = new Date('2022-04-23 06:30:00')
  const realtimeList1 = getLastNDateStrings(DatePeriod.realtime, 10, beginHourNormal)
  // console.log('realtimeList1：', realtimeList1);

  const beginHourBreak1 = new Date('2022-04-23 06:02:00')
  const realtimeList2 = getLastNDateStrings(DatePeriod.realtime, 10, beginHourBreak1)
  // console.log('realtimeList2：', realtimeList2);

  const beginHourBreak2 = new Date('2022-04-23 06:03:00')
  const realtimeList3 = getLastNDateStrings(DatePeriod.realtime, 10, beginHourBreak2)
  // console.log('realtimeList3：', realtimeList3);

  expect(realtimeList1).toEqual([
    '2022-04-23 05',
    '2022-04-23 04',
    '2022-04-23 03',
    '2022-04-23 02',
    '2022-04-23 01',
    '2022-04-23 00',
    '2022-04-22 23',
    '2022-04-22 22',
    '2022-04-22 21',
    '2022-04-22 20',
  ])
  expect(realtimeList2).toEqual([
    '2022-04-23 04',
    '2022-04-23 03',
    '2022-04-23 02',
    '2022-04-23 01',
    '2022-04-23 00',
    '2022-04-22 23',
    '2022-04-22 22',
    '2022-04-22 21',
    '2022-04-22 20',
    '2022-04-22 19',
  ])
  expect(realtimeList3).toEqual([
    '2022-04-23 05',
    '2022-04-23 04',
    '2022-04-23 03',
    '2022-04-23 02',
    '2022-04-23 01',
    '2022-04-23 00',
    '2022-04-22 23',
    '2022-04-22 22',
    '2022-04-22 21',
    '2022-04-22 20',
  ])
  expect(true)
})
