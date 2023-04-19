import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/*
 * 同步官网博客的 请求参数：
 */
export type XTopicBlogSyncParams = AilabServerParams

export interface XTopicBlogSyncMeta {
  title?: string

  blogName: string

  // 设定发布时间，是一个可以转成 Date 的 string
  createdAt: string

  // 作者：一定要存在于讨论区中
  author: string
}

/**
 * 同步官网博客的 请求参数（写到 body 里面）
 */
export interface XTopicBlogSyncBody {
  /**
   * 要同步的博客名称
   */
  metaList: XTopicBlogSyncMeta[]
}

/*
 * 同步官网博客的 主要响应内容：
 */
export interface XTopicBlogSyncResult {
  metaList: XTopicBlogSyncMeta[]
}

export type XTopicBlogSyncConfig = AilabServerApiConfig<
  XTopicBlogSyncParams,
  XTopicBlogSyncResult,
  XTopicBlogSyncBody
>
