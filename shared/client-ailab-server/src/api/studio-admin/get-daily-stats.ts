import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface GetDailyStatsParams extends AilabServerParams {
  limit?: number
}

export type GetDailyStatsResult = {
  [date: string]: { occupied: number; usage: number; efficiency: number }
}

export type GetDailyStatsApiConfig = AilabServerApiConfig<GetDailyStatsParams, GetDailyStatsResult>
