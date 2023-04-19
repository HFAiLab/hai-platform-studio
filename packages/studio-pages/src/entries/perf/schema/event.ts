import type { Chain } from '../../../model/Chain'

export enum EventsKeys {
  ThemeChange = 'ThemeChange',
}

export const DARK_THEME_KEY = 'JupyterLab Dark'

export interface ThemeConfig {
  theme: string
}

export interface LogMeta {
  chain: Chain | null
  rank: number
}

export type EventParams = {
  [EventsKeys.ThemeChange]: ThemeConfig
}
