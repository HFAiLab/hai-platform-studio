import type { EmitterMethod } from 'event-emitter'
import EventEmitter from 'event-emitter'
import type { Themes } from '../../utils/theme'
import type { CustomHomePanelsConfig } from '../settings/config'

export enum WebEventsKeys {
  invokeChangeLogRank = 'invokeChangeLogRank',
  themeChange = 'themeChange',
  logVisibleUpdated = 'logVisibleUpdated',
  refreshDashboard = 'refreshDashboard',
  slientRefreshDashboard = 'slientRefreshDashboard',
  tutorialTerminalRunCMD = 'tutorialTerminalRunCMD',
  containerAdminSearchChange = 'containerAdminSearchChange',
  homeDNDStrategyChange = 'homeDNDStrategyChange',
}

export interface InvokeChangeLogRankParams {
  chain_id: string
  rank: number
}

export interface ThemeChangeParams {
  newTheme: Themes
}

export type WebEventParams = {
  [WebEventsKeys.invokeChangeLogRank]: InvokeChangeLogRankParams
  [WebEventsKeys.themeChange]: ThemeChangeParams
  [WebEventsKeys.logVisibleUpdated]: string[]
  [WebEventsKeys.refreshDashboard]: null
  [WebEventsKeys.slientRefreshDashboard]: null
  [WebEventsKeys.tutorialTerminalRunCMD]: string
  [WebEventsKeys.containerAdminSearchChange]: string
  [WebEventsKeys.homeDNDStrategyChange]: CustomHomePanelsConfig
}

export class HFEventEmitter {
  protected ee: EventEmitter.Emitter

  constructor() {
    this.ee = EventEmitter({})
  }

  emit<T extends WebEventsKeys>(type: T, args: WebEventParams[T]) {
    this.ee.emit(type as string, args)
  }

  on<T extends WebEventsKeys>(type: T, fn: (params: WebEventParams[T]) => any) {
    this.ee.on(type, fn as unknown as EmitterMethod)
  }

  off<T extends WebEventsKeys>(type: T, fn: (params: WebEventParams[T]) => any) {
    this.ee.off(type, fn as unknown as EmitterMethod)
  }

  once<T extends WebEventsKeys>(type: T, fn: (params: WebEventParams[T]) => any) {
    this.ee.once(type, fn as unknown as EmitterMethod)
  }
}

export const hfEventEmitter = new HFEventEmitter()
