import type { CreateUserSchema } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/**
 * 创建用户的请求参数：
 */
export type CreateUserParams = ApiServerParams

/**
 * 创建用户的请求参数（写到 body 里面）
 */
export type CreateUserBody = CreateUserSchema

/*
 * 创建用户的主要响应内容：
 */
export interface CreateUserResult {
  user_id: number // 用户 ID
  user_name: string // 用户名
  token: string // 用户 token
}

export type CreateUserConfig = ApiServerApiConfig<
  CreateUserParams,
  CreateUserResult,
  CreateUserBody
>
