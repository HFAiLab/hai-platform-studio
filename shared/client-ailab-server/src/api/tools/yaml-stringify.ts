import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * yaml 序列化最新版本请求参数：
 */
export type YamlStringifyParams = AilabServerParams

/**
 * yaml 序列化最新版本请求参数（写到 body 里面）
 */
export type YamlStringifyBody = {
  content: Record<string, unknown> | Record<string, unknown>[]
}

/*
 * yaml 序列化主要响应内容：
 */
export interface YamlStringifyResult {
  results: string | string[]
}

export type YamlStringifyConfig = AilabServerApiConfig<
  YamlStringifyParams,
  YamlStringifyResult,
  YamlStringifyBody
>
