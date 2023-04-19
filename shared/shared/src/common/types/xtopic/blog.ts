/*
 *暂时 blog 只是一种特殊的 post，特殊之处也仅仅在于对应的 post 存在 blogName 这个字段
 */
export interface BlogMetaInfo {
  title: string
  date: string
  description: string
  tags: string[]
  author: string
  /**
   * blog 的唯一用户名
   * */
  blogName: string
}

export interface BlogPostMetaInfo extends BlogMetaInfo {
  ifSync: boolean
  syncTime: Date | null
}
