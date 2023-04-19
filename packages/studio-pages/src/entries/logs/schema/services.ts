import type { Chain } from '../../../model/Chain'

export enum LogServiceNames {
  getCurrentLogChain = 'getCurrentLogChain',
  getCurrentLogRank = 'getCurrentLogRank',
  getCurrentLogService = 'getCurrentLogService',
  invokeRankChanged = 'invokeRankChanged',
  getTheme = 'getTheme',
  getHandleCR = 'getHandleCR',
  GetLogSharedURL = 'GetLogSharedURL',
}

export enum LogModuleVersion {
  V1 = 1,
  V2 = 2,
}

export interface GetLogSharedURLOptions {
  chainId: string
}

export type LogServiceParams = {
  [LogServiceNames.getCurrentLogChain]: null
  [LogServiceNames.getCurrentLogRank]: null
  [LogServiceNames.getCurrentLogService]: null
  [LogServiceNames.invokeRankChanged]: number
  [LogServiceNames.getTheme]: null
  [LogServiceNames.getHandleCR]: null
  [LogServiceNames.GetLogSharedURL]: GetLogSharedURLOptions
}

export type LogServiceResult = {
  [LogServiceNames.getCurrentLogChain]: Chain | null
  [LogServiceNames.getCurrentLogRank]: number
  [LogServiceNames.getCurrentLogService]: string
  [LogServiceNames.invokeRankChanged]: void
  [LogServiceNames.getTheme]: string
  [LogServiceNames.getHandleCR]: boolean
  [LogServiceNames.GetLogSharedURL]: string
}

export enum AsyncLogServiceNames {
  notImplement = 'notImplement',
}

export type AsyncLogServiceParams = {
  [AsyncLogServiceNames.notImplement]: null
}

export type AsyncLogServiceResult = {
  [AsyncLogServiceNames.notImplement]: null
}
