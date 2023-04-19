import type { CreateTaskV2Schema, ServiceTaskCreateV2Schema } from './create-task'
import type { ContainerService } from './service'
import type { TaskPriority } from './task-properties'

/**
 * 任务配置
 */
export type TaskConfigJson = Record<string, unknown>

/**
 * 训练任务配置
 */
export interface TaskConfigJsonTraining extends TaskConfigJson {
  /**
   * 提交任务时用户原始真实选择的分组，带后缀分区等信息，例如 xxx#A
   */
  client_group?: string | null

  /**
   * 环境变量
   * 这个里面目前没有 hf_env 的相关信息了
   */
  environments: Record<string, string | number>

  /**
   * 提交任务时的分区信息
   */
  schedule_zone?: string | null

  /**
   * 自定义镜像，会写到这里，不建议使用
   */
  train_image?: string | null

  /**
   * 用户 create_task_v2 提交的 schema
   */
  schema?: CreateTaskV2Schema

  /**
   * 提交任务时的 whole_life_state
   */
  whole_life_state: number
}

/**
 * Jupyter 任务配置
 */
export interface TaskConfigJsonJupyter extends TaskConfigJson {
  /**
   * 环境变量
   */
  environments: Record<string, string>

  /**
   * 启动的服务
   */
  services: Record<string, Record<string, string | number | boolean>>

  /**
   * CPU (core)
   */
  cpu: number

  /**
   * 内存 (G)
   */
  memory: number

  /**
   * 是否是 spot container
   */
  is_spot?: boolean

  /**
   * version 控制一些 api 的调用，在比较早期的版本是没有这个 version 的
   */
  version?: number

  /*
   * 用户自定义的 image
   */
  train_image?: string

  /**
   * 新加一个 schema，这个 schema 就是 create_task_v2 传递的 body
   */
  schema: ServiceTaskCreateV2Schema
}

export interface TaskRuntimeConfigJson {
  runtime_priority: { custom_rank: number; update_priority_called: boolean }
  running_priority: { priority: TaskPriority; timestamp: number }[]
  scheduler_assign_rule: number
}

/**
 * 给开发容器用的 runtime config_json，如果有字段不重合后面还要拆出来
 */
export interface ContainerTaskRuntimeConfigJson extends TaskRuntimeConfigJson {
  /*
   * service_task:
   * 需要注意在任务 manager 启动的时候（此时处于 building 中）才会生成，在此之前任务是没有这个字段的
   */
  service_task?: {
    version: number
    services: {
      /**
       * 这里和 schema 里面不同的是，这里的是实时的信息状态！！
       */
      [key: string]: ContainerService
    }
  }
}
