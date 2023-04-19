import type { Chain } from '../../../model/Chain'

export enum EventsKeys {
  ThemeChange = 'ThemeChange',
  LogMetaChange = 'LogMetaChange',
  LogRefresh = 'LogRefresh',
  VisibilityChanged = 'VisibilityChanged',
  SplitLineJump = 'SplitLineJump',
}

export const DARK_THEME_KEY = 'JupyterLab Dark'

export interface ThemeConfig {
  theme: string
}

export interface LogMeta {
  chain: Chain | null
  rank: number
  service?: string
}

export interface ChainUpdateArgs {
  chainId: Chain['chain_id']
  sender?: any
}

export interface SplitLineJumpOptions {
  direction: 'up' | 'down' | 'bottom'
}

export type EventParams = {
  [EventsKeys.ThemeChange]: ThemeConfig
  [EventsKeys.LogMetaChange]: LogMeta
  [EventsKeys.LogRefresh]: LogMeta
  [EventsKeys.VisibilityChanged]: boolean
  [EventsKeys.SplitLineJump]: SplitLineJumpOptions
}
