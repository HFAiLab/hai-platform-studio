import type { Chain } from '../../../model/Chain'

export enum EventsKeys {
  ThemeChange = 'ThemeChange',
  LogMetaChange = 'LogMetaChange',
  LogRefresh = 'LogRefresh',
  AssignSelectChain = 'AssignSelectChain',
  ResetFilters = 'ResetFilters',
}

export const DARK_THEME_KEY = 'JupyterLab Dark'

export interface ThemeConfig {
  theme: string
}

export interface LogMeta {
  chain: Chain | null
  rank: number
}

export interface ChainUpdateArgs {
  chainId: Chain['chain_id']
  sender?: any
}

export type EventParams = {
  [EventsKeys.ThemeChange]: ThemeConfig
  [EventsKeys.LogMetaChange]: LogMeta
  [EventsKeys.LogRefresh]: LogMeta
  [EventsKeys.AssignSelectChain]: Chain | null
  [EventsKeys.ResetFilters]: null
}
