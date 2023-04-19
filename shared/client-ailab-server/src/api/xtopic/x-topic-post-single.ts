import type { XTopicPostSchema, XTopicUserPublicInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export interface XTopicPostExtendedSchema
  extends Omit<XTopicPostSchema, 'createdAt' | 'updatedAt'> {
  createdAt: string

  updatedAt: string

  nickname?: string

  // 是不是我自己发布的
  isSelfPost?: boolean

  userInfo?: XTopicUserPublicInfo | null
}

/**
 * 获取话题详情 的接口参数
 */
export interface XTopicPostDetailParams extends AilabServerParams {
  index: number
}

export type XTopicPostDetailResult = XTopicPostExtendedSchema

export type XTopicPostDetailConfig = AilabServerApiConfig<
  XTopicPostDetailParams,
  XTopicPostDetailResult
>
