import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 上报访问量最新版本请求参数：
 */
export type XTopicPostVisitParams = AilabServerParams

/**
 * 上报访问量最新版本请求参数（写到 body 里面）
 */
export type XTopicPostVisitBody = {
  postIndex: number
}

/*
 * 上报访问量主要响应内容：
 */
export type XTopicPostVisitResult = null

export type XTopicPostVisitConfig = AilabServerApiConfig<
  XTopicPostVisitParams,
  XTopicPostVisitResult,
  XTopicPostVisitBody
>
