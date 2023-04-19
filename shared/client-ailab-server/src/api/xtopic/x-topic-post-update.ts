import type { ExtendedTask } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'
import type { XTopicPostInsertBody } from './x-topic-post-insert'

/*
 * 修改发帖内容的最新版本请求参数：
 */
export type XTopicPostUpdateParams = AilabServerParams

/**
 * 修改发帖内容的最新版本请求参数（写到 body 里面）
 */
export type XTopicPostUpdateBody = Partial<XTopicPostInsertBody>
/*
 * 修改发帖内容的主要响应内容：
 */
export interface XTopicPostUpdateResult {
  task: ExtendedTask
}

export type XTopicPostUpdateConfig = AilabServerApiConfig<
  XTopicPostUpdateParams,
  XTopicPostUpdateResult,
  XTopicPostUpdateBody
>
