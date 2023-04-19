import type { TaskPriority } from './task-properties'

/**
 * 任务提交时所采用的 yaml 规范
 * V2 版本
 *
 * @reference
 * multi_gpu_runner_server/hfai/client/api/experiment_api.py
 */
export interface TaskCreateYamlSchemaV2 {
  version: 2
  name: string
  priority: TaskPriority
  spec: {
    workspace: string
    entrypoint: string
    parameters?: string
    environments?: Record<string, string | number>
    // 可选，默认为 false
    entrypoint_executable?: boolean
  }
  resource: {
    image?: string
    group?: string
    node_count?: number
  }
  options?: {
    whole_life_state?: number
    mount_code?: number
    py_venv?: string
    tags?: string[]
    watchdog_time?: number
  }
}
