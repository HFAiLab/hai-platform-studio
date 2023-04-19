import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * toml 解析成对象最新版本请求参数：
 */
export type TomlParseParams = AilabServerParams

/**
 * toml 解析成对象最新版本请求参数（写到 body 里面）
 */
export type TomlParseBody = {
  content: string | string[]
}

/*
 * toml 解析成对象主要响应内容：
 */
export interface TomlParseResult {
  results: Record<string, unknown> | Record<string, unknown>[]
}

export type TomlParseConfig = AilabServerApiConfig<TomlParseParams, TomlParseResult, TomlParseBody>
