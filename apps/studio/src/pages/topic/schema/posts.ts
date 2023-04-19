import type { XTopicPostListResult } from '@hai-platform/client-ailab-server'
import type { XTopicMeiliSearchResult } from '@hai-platform/shared'

export type CombinePostsResult =
  | {
      type: 'flow'
      posts: XTopicPostListResult
    }
  | {
      type: 'search'
      posts: XTopicMeiliSearchResult
    }
