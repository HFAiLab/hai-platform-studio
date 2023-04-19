import type { ApiServerParams } from '../../types'

export type LogForestLogDetailApiParamsMode = 'minute' | '15_minutes' | 'hour' | 'day'
export interface LogForestLogDetailApiParams extends ApiServerParams {
  mode: LogForestLogDetailApiParamsMode

  tick: string
}
export type LogForestManagerPodSeverity = 'info' | 'warning' | 'error'
