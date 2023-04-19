import type {
  XTopicLikeAddBody,
  XTopicNotificationListSchema,
} from '@hai-platform/client-ailab-server'
import { XTopicNotificationType } from '@hai-platform/shared'
import { logger } from '../../base/logger'
import { HFSequelize } from '../../orm'
import type { XTopicNotification } from '../../orm/models/xtopic/Notification'
import type { XTopicReply } from '../../orm/models/xtopic/Reply'
import { GlobalXTopicUserInfoManager } from './userInfo'

export const NOTIFICATION_ACTOR_SPLITTER = ', '
export const NOTIFICATION_UNKNOWN_ACTOR_NICKNAME = '集群用户'

export class NotificationManager {
  // 帖子被回复
  async notifyPostReplied(reply: XTopicReply) {
    const hfSequelize = await HFSequelize.getInstance()
    const postMeta = await hfSequelize.XTopicPosts.getPostMeta(reply.postIndex)
    if (!postMeta) {
      logger.error('帖子被回复的通知没有找到对应的帖子')
      return
    }
    if (postMeta.author === reply.author) return // 自己给自己回帖不需要发通知
    const lastNotification = await hfSequelize.xTopicNotification.find({
      notifier: postMeta.author,
      type: XTopicNotificationType.REPLY_NEW,
      postIndex: reply.postIndex,
      read: false,
    })
    if (lastNotification) {
      // 找到对同一条的回复的点赞，聚合
      const actors = new Set(lastNotification.actor.split(NOTIFICATION_ACTOR_SPLITTER))
      actors.add(reply.author)
      await hfSequelize.xTopicNotification.update(lastNotification.index, {
        actor: [...actors].join(NOTIFICATION_ACTOR_SPLITTER),
        sourceIndex: reply.index, // 更新到最新的回复
        aggregate: true,
        aggregateCount: lastNotification.aggregateCount + 1,
        lastUpdatedAt: new Date(),
      })
    } else {
      await hfSequelize.xTopicNotification.insert({
        notifier: postMeta.author,
        actor: reply.author,
        type: XTopicNotificationType.REPLY_NEW,
        sourceType: 'reply',
        sourceIndex: reply.index,
        postIndex: reply.postIndex,
        aggregate: false,
        aggregateCount: 1,
      })
    }

    if (reply.referReplyIndex) {
      // 再发一条给被引用的用户
      const referReplyMeta = await hfSequelize.XTopicReply.getReplyMeta(reply.referReplyIndex)
      if (!referReplyMeta) return
      if (referReplyMeta.author === reply.author) return // 自己引用自己不需要发通知
      const lastReferNotification = await hfSequelize.xTopicNotification.find({
        notifier: referReplyMeta.author,
        type: XTopicNotificationType.REPLY_REFERRED,
        sourceIndex: reply.referReplyIndex,
        read: false,
      })
      if (lastReferNotification) {
        // 找到对同一条的回复的点赞，聚合
        const actors = new Set(lastReferNotification.actor.split(NOTIFICATION_ACTOR_SPLITTER))
        actors.add(reply.author)
        await hfSequelize.xTopicNotification.update(lastReferNotification.index, {
          actor: [...actors].join(NOTIFICATION_ACTOR_SPLITTER),
          aggregate: true,
          aggregateCount: lastReferNotification.aggregateCount + 1,
          lastUpdatedAt: new Date(),
        })
      } else {
        await hfSequelize.xTopicNotification.insert({
          notifier: referReplyMeta.author,
          actor: reply.author,
          type: XTopicNotificationType.REPLY_REFERRED,
          sourceType: 'reply',
          sourceIndex: reply.referReplyIndex,
          postIndex: reply.postIndex,
          aggregate: false,
          aggregateCount: 1,
        })
      }
    }
  }

  // 帖子被点赞
  async notifyPostLiked(like: XTopicLikeAddBody) {
    const hfSequelize = await HFSequelize.getInstance()
    const postMeta = await hfSequelize.XTopicPosts.getPostMeta(like.itemIndex)
    if (!postMeta) {
      logger.error('点赞帖子的通知没有找到对应的帖子')
      return
    }
    if (postMeta.author === like.username) return // 自己给自己点赞不需要发通知
    const lastNotification = await hfSequelize.xTopicNotification.find({
      notifier: postMeta.author,
      type: XTopicNotificationType.POST_LIKED,
      sourceIndex: like.itemIndex,
      read: false,
    })
    if (lastNotification) {
      // 找到对同一条的回复的点赞，聚合
      const actors = new Set(lastNotification.actor.split(NOTIFICATION_ACTOR_SPLITTER))
      actors.add(like.username)
      await hfSequelize.xTopicNotification.update(lastNotification.index, {
        actor: [...actors].join(NOTIFICATION_ACTOR_SPLITTER),
        aggregate: true,
        aggregateCount: lastNotification.aggregateCount + like.likeCount,
        lastUpdatedAt: new Date(),
      })
    } else {
      // 新通知
      await hfSequelize.xTopicNotification.insert({
        notifier: postMeta.author,
        actor: like.username,
        type: XTopicNotificationType.POST_LIKED,
        sourceType: 'post',
        sourceIndex: like.itemIndex,
        postIndex: like.itemIndex,
        aggregate: false,
        aggregateCount: like.likeCount,
      })
    }
  }

  // 回复被点赞
  async notifyReplyLiked(like: XTopicLikeAddBody) {
    const hfSequelize = await HFSequelize.getInstance()
    const replyMeta = await hfSequelize.XTopicReply.getReplyMeta(like.itemIndex)
    if (!replyMeta) {
      logger.error('点赞回复的通知没有找到对应的回复')
      return
    }
    if (replyMeta.author === like.username) return // 自己给自己点赞不需要发通知
    const lastNotification = await hfSequelize.xTopicNotification.find({
      notifier: replyMeta.author,
      type: XTopicNotificationType.REPLY_LIKED,
      sourceIndex: like.itemIndex,
      read: false,
    })
    if (lastNotification) {
      // 找到对同一条的回复的点赞，聚合
      const actors = new Set(lastNotification.actor.split(NOTIFICATION_ACTOR_SPLITTER))
      actors.add(like.username)
      await hfSequelize.xTopicNotification.update(lastNotification.index, {
        actor: [...actors].join(NOTIFICATION_ACTOR_SPLITTER),
        aggregate: true,
        aggregateCount: lastNotification.aggregateCount + like.likeCount,
        lastUpdatedAt: new Date(),
      })
    } else {
      // 新通知
      await hfSequelize.xTopicNotification.insert({
        notifier: replyMeta.author,
        actor: like.username,
        type: XTopicNotificationType.REPLY_LIKED,
        sourceType: 'reply',
        sourceIndex: like.itemIndex,
        postIndex: replyMeta.postIndex,
        aggregate: false,
        aggregateCount: like.likeCount,
      })
    }
  }

  // 帖子被置顶/删除/锁定 都用这一个
  async notifyPost(postIndex: number, type: XTopicNotificationType) {
    const hfSequelize = await HFSequelize.getInstance()
    const postMeta = await hfSequelize.XTopicPosts.getPostMeta(postIndex)
    if (!postMeta) {
      logger.error('帖子操作的通知没有找到对应的帖子')
      return
    }
    await hfSequelize.xTopicNotification.insert({
      notifier: postMeta.author,
      actor: '',
      type,
      sourceType: 'post',
      sourceIndex: postIndex,
      postIndex,
      aggregate: false,
    })
  }

  // 回复被删除
  async notifyReplyDeleted(reply: XTopicReply) {
    const hfSequelize = await HFSequelize.getInstance()
    await hfSequelize.xTopicNotification.insert({
      notifier: reply.author,
      actor: '',
      type: XTopicNotificationType.REPLY_DELETED,
      sourceType: 'reply',
      sourceIndex: reply.index,
      postIndex: reply.postIndex,
      aggregate: false,
    })
  }

  // 自定义内容
  async notifyCustom(notifier: string, content: string, sourceIndex?: number) {
    const hfSequelize = await HFSequelize.getInstance()
    await hfSequelize.xTopicNotification.insert({
      notifier,
      actor: '',
      type: XTopicNotificationType.CUSTOM,
      aggregate: false,
      content,
      sourceIndex,
      sourceType: 'custom',
    })
  }

  async renderNotification(
    notification: XTopicNotification,
  ): Promise<XTopicNotificationListSchema> {
    const { postIndex, type, actor, aggregate, aggregateCount } = notification
    const hfSequelize = await HFSequelize.getInstance()
    const content = (await hfSequelize.xTopicNotificationTemplate.getContent(type, aggregate)) ?? ''
    let meta = {}
    switch (notification.type) {
      case XTopicNotificationType.POST_TOPPED:
      case XTopicNotificationType.POST_DELETED:
      case XTopicNotificationType.POST_LOCKED:
      case XTopicNotificationType.REPLY_DELETED: {
        const postMeta = await hfSequelize.XTopicPosts.getPostMeta(postIndex, true)
        meta = { postTitle: postMeta?.title, postIndex }
        break
      }
      case XTopicNotificationType.REPLY_NEW:
      case XTopicNotificationType.REPLY_REFERRED:
      case XTopicNotificationType.POST_LIKED:
      case XTopicNotificationType.REPLY_LIKED: {
        const postMeta = await hfSequelize.XTopicPosts.getPostMeta(postIndex, true)
        if (aggregate) {
          const users = actor
            .split(NOTIFICATION_ACTOR_SPLITTER)
            .map(
              (u) =>
                GlobalXTopicUserInfoManager.getNickNameByUserName(u) ??
                NOTIFICATION_UNKNOWN_ACTOR_NICKNAME,
            )
          meta = { postTitle: postMeta?.title, postIndex, users, aggregateCount }
        } else {
          const userName =
            GlobalXTopicUserInfoManager.getNickNameByUserName(actor) ??
            NOTIFICATION_UNKNOWN_ACTOR_NICKNAME
          meta = { postTitle: postMeta?.title, postIndex, userName }
        }
        break
      }
      case XTopicNotificationType.CUSTOM: {
        meta = { content: notification.content }
        break
      }
      case XTopicNotificationType.USER_BANNED:
      default:
        break
    }
    // @ts-expect-error 脱敏操作 去掉 username
    delete notification.actor
    // @ts-expect-error 脱敏操作 去掉 username
    delete notification.notifier
    const result = { ...notification, meta, content }
    return result
  }
}
export const GlobalNotificationManager = new NotificationManager()
