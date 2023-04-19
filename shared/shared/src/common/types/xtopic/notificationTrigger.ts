// 自动发送【自定义】消息的触发器
// 首次登陆的

// 触发器表：
// 	index  -> sourceIndex
// 	content :string
// 	triggerCount: number
// 	receiver: __internal, __external, [<userName>,...]
// 	CreatedAt: Date
// 	addBy	: string
// 	expires: Date
// 	enabled: boolean

export interface XTopicNotificationTriggerSchema {
  // 触发器 ID
  index: number

  // 消息内容
  content: string

  // 触发计数
  triggerCount: number

  // 接收对象
  receiver: string

  // 添加该触发器的人
  addBy: string

  // 触发时机
  triggerEvent: string

  // 触发多次
  triggerMultiple: boolean

  // 触发器有效期
  expires: Date

  // 是否启用
  enabled: boolean

  // 创建时间
  createdAt: Date

  // 删除
  deleted: boolean
}
