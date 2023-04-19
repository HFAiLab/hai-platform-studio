export interface XTopicUserSchema {
  id: number

  // 用户在平台上的用户名
  platformName: string

  // 用户昵称
  nickname: string

  // 用户头像
  avatar: string

  // 一句话介绍自己
  bio: string

  updatedAt: Date

  createdAt: Date
}

// 可以对大家展示的 UserInfo 的部分字段
export type XTopicUserPublicInfo = Pick<XTopicUserSchema, 'avatar' | 'bio' | 'nickname'>
