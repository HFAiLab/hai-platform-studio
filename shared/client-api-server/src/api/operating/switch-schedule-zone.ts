import type { TaskScheduleZoneConfig } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * [管理员接口] 改变 schedule zone, 支持按 username / task id / chain id 操作
 */
export interface SwitchScheduleZoneParams extends ApiServerParams {
  schedule_zone: TaskScheduleZoneConfig
  user_name?: string
  task_id?: number
  chain_id?: number
}

export interface SwitchScheduleZoneResult {
  msg?: string
}

export type SwitchScheduleZoneConfig = ApiServerApiConfig<
  SwitchScheduleZoneParams,
  SwitchScheduleZoneResult
>
