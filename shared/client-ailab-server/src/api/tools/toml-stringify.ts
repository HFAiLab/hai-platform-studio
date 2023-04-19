import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * toml 序列化最新版本请求参数：
 */
export type TomlStringifyParams = AilabServerParams

/**
 * toml 序列化最新版本请求参数（写到 body 里面）
 */
export type TomlStringifyBody = {
  content: Record<string, unknown> | Record<string, unknown>[]
}

/*
 * toml 序列化主要响应内容：
 */
export interface TomlStringifyResult {
  results: string | string[]
}

export type TomlStringifyConfig = AilabServerApiConfig<
  TomlStringifyParams,
  TomlStringifyResult,
  TomlStringifyBody
>
