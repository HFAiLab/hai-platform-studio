import type { XTopicPost } from '../../orm/models/xtopic/Post'

export class MeiliRowKey {
  static getRowKeyFromXTopicPost(post: XTopicPost) {
    return `xtopic_post--${post.uuid}`
  }
}
