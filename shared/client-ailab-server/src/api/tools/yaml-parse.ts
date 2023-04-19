import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * yaml 解析成对象最新版本请求参数：
 */
export type YamlParseParams = AilabServerParams

/**
 * yaml 解析成对象最新版本请求参数（写到 body 里面）
 */
export type YamlParseBody = {
  content: string | string[]
}

/*
 * yaml 解析成对象主要响应内容：
 */
export interface YamlParseResult {
  results: Record<string, unknown> | Record<string, unknown>[]
}

export type YamlParseConfig = AilabServerApiConfig<YamlParseParams, YamlParseResult, YamlParseBody>
