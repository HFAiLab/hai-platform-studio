import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type GetTop10NodeUsageByZoneParams = AilabServerParams

export type Top10NodeUsageSeriesItem = [number, string] // [timestamp, node num]

export type Top10NodeUsageSeries = Top10NodeUsageSeriesItem[]

export type Top10NodeUsageZoneInfo = [string, Top10NodeUsageSeries][]

export interface UserStorageUsageByZone {
  A: Top10NodeUsageZoneInfo
  B: Top10NodeUsageZoneInfo
  time: [number, number]
}

export type GetUserStorageUsageResult = UserStorageUsageByZone

export type GetTop10NodeUsageByZoneApiConfig = AilabServerApiConfig<
  GetTop10NodeUsageByZoneParams,
  UserStorageUsageByZone
>
