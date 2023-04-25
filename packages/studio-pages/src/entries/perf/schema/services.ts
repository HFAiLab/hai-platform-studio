import type { Chain } from '../../../model/Chain'
import type { IQueryType } from '../../../schemas/basic'
import type { PerfDataInterval, PerfQueryType } from '../../perf/widgets/ChartBlock'

export enum PerfServiceAbilityNames {
  duplicate = 'duplicate',
}

export enum PerfServiceNames {
  getTheme = 'getTheme',
  openPerformanceChart = 'openPerformanceChart',
}

export enum PerfModuleVersion {
  V1 = 1,
  V2 = 2,
}

export type PerfServiceParams = {
  [PerfServiceNames.getTheme]: null
  [PerfServiceNames.openPerformanceChart]: {
    chain: Chain
    rank: number
    continuous: boolean
    type: PerfQueryType
    duplicate: boolean
    creatorQueryType: IQueryType
    dataInterval: PerfDataInterval
  }
}

export type PerfServiceResult = {
  [PerfServiceNames.getTheme]: string
  [PerfServiceNames.openPerformanceChart]: void
}

export enum AsyncPerfServiceNames {
  notImplement = 'notImplement',
}

export type AsyncPerfServiceParams = {
  [AsyncPerfServiceNames.notImplement]: null
}

export type AsyncPerfServiceResult = {
  [AsyncPerfServiceNames.notImplement]: null
}
