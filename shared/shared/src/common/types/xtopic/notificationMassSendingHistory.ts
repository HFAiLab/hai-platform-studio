// 管理员群发自定义消息的历史记录

// 记录表：
// 	id
// 	content :string
// 	messageCount: number
//  sender: string
// 	receiver: __internal, __external, [<userName>,...]
// 	CreatedAt: Date

export interface XTopicNotificationMassSendingHistorySchema {
  // 日志 id
  id: number

  // 消息内容
  content: string

  // 发送计数
  messageCount: number

  // 发送人
  sender: string

  // 接收对象
  receiver: string

  // 备注等
  notes: string

  // 创建时间
  createdAt: Date
}
