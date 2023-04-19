import type { GetTrainImagesResult } from '@hai-platform/client-api-server'
import type { IClusterInfoUsage } from '@hai-platform/shared'

export type ExperimentPanelMode = 'onlyRead' | 'readControl' | 'readWrite'

// groupList 等需要用到
export interface IClusterInfo {
  trainImages: GetTrainImagesResult
  usage: IClusterInfoUsage[]
  env: Array<string>
}

export interface PriorityInfo {
  name: string
  value: number
}

/** 真正的，用于 jupyter 创建实验的时候的参数 */
export interface CreateExperimentParams {
  nb_name: string
  directory: string
  entrypoint: string
  container: string
  priority: number
  whole_life_state: number
  parameters: string
  restart_job: true
  groups: [{ group: string; node_count: number }]
  mount_code: number
  entrypoint_executable: boolean
  watchdog_time?: number
  tags?: string[]
}

export interface HaiEnvItem {
  extend?: 'True' | 'False'
  extend_env?: string
  haienv_name: string
  path: string
  py: string
  user: string
}
