export interface ClusterUserMessageSchema {
  /**
   * 消息 id
   */
  messageId: number
  /**
   * 是否重要
   */
  important: boolean
  /**
   * 消息的类型，enum：
   */
  type?: 'normal' | 'warning' | 'danger' | 'success' | null
  /**
   * 标题
   */
  title?: string
  /**
   * 主体内容
   */
  content: string
  /**
   * 详细内容（链接或者一段话）
   */
  detailContent?: string
  /**
   * 开始触达到用户的日期
   */
  date?: Date
  /**
   * 详细内容的文本
   */
  detailText?: string
  /**
   * 给哪些用户/用户组
   */
  assigned_to: string
  /**
   * 过期时间
   */
  expiry: Date
}
