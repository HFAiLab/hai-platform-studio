export type XTopicContentType = 'post' | 'reply' | 'comment'
export enum XTopicNotificationType {
  POST_TOPPED = 'post.topped', // 帖子被置顶
  POST_DELETED = 'post.deleted', // 帖子被删除
  POST_LOCKED = 'post.locked', // 帖子被锁定
  POST_LIKED = 'post.liked', // 帖子被点赞
  REPLY_NEW = 'reply.new', // 新回复
  REPLY_DELETED = 'reply.deleted', // 回复被删除
  REPLY_LIKED = 'reply.liked', // 回复被点赞
  REPLY_REFERRED = 'reply.referred', // 回复被引用
  USER_BANNED = 'user.banned', // 预留，用户被禁言
  CUSTOM = 'custom.custom', // 预留，自定义的通知
}
export type XTopicNotificationSourceType = 'post' | 'reply' | 'user' | 'custom'
export enum NotificationItemCategory {
  SYSTEM_NOTIFICATION = '系统消息',
  LIKE_NOTIFICATION = '点赞',
  REPLY_NOTIFICATION = '回复',
  ALL_NOTIFICATION = '全部类型',
}

export enum NotificationSpecialReceiver {
  INTERNAL = '__internal',
  EXTERNAL = '__external',
  PUBLIC = '__public',
}

export enum NotificationTriggerEvent {
  REQUEST_LIST = 'request_list',
  USER_UPDATE = 'user_update',
}
