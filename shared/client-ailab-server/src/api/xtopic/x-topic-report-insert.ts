import type { XTopicReportSchema } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 举报最新版本请求参数：
 */
export type XTopicReportInsertParams = AilabServerParams

/**
 * 举报最新版本请求参数（写到 body 里面）
 */
export type XTopicReportInsertBody = Pick<
  XTopicReportSchema,
  'contentType' | 'itemUUID' | 'reason' | 'submitter' | 'itemIndex'
>

/*
 * 举报主要响应内容：
 */
export interface XTopicReportInsertResult {
  basicItem: XTopicReportSchema
}

export type XTopicReportInsertConfig = AilabServerApiConfig<
  XTopicReportInsertParams,
  XTopicReportInsertResult,
  XTopicReportInsertBody
>
