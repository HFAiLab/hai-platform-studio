import type { CreateTaskV2Schema, ExtendedTask } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 创建实验的最新版本请求参数：
 */
export type CreateTaskV2Params = ApiServerParams

/**
 * 创建实验的最新版本请求参数（写到 body 里面）
 */
export type CreateTaskV2Body = CreateTaskV2Schema

/*
 * 创建实验的主要响应内容：
 */
export interface CreateTaskV2Result {
  task: ExtendedTask
}

export type CreateTaskV2Config = ApiServerApiConfig<
  CreateTaskV2Params,
  CreateTaskV2Result,
  CreateTaskV2Body
>
