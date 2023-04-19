/**
 * 看板的帖子条目基础类
 */
export interface XTopicItemSchema {
  /* ********************************************** 索引部分 *************************************************** */

  // 充当 ID，递增，唯一
  index: number

  // 回帖 UUID，可以看下是否有必要
  uuid: string

  updatedAt: Date

  createdAt: Date

  // 如果是提问，就是提问的详情
  // 如果是回答，就是回答的详情
  content: string

  /* ********************************************** 元信息部分 *************************************************** */
  // 初次提交人，作者
  author: string

  // 编辑人列表：后编辑的在后面
  // 因为有管理员，所以这里需要记录一下
  editorList: string[]

  // 编辑时间列表，后编辑的在后面
  editorTimeList: string[]

  /* ********************************************** 管理员 部分 *************************************************** */
  // 是否置顶，默认应该是 0，越大，越靠前
  pin: number

  // 是否可见
  visible: boolean

  // 是否已经删除了
  deleted: boolean

  // 锁住整个帖子，预留
  locked: boolean

  // 锁评论，预留
  locked_reply: boolean

  /* ********************************************** UGC 部分 *************************************************** */
  // 点赞数
  likeCount: number
}

/**
 * 话题的回帖 Schema
 */
export interface XTopicReplySchema extends XTopicItemSchema {
  // 这个回答从哪个帖子开始
  postIndex: number

  // 引用的是哪个回帖
  referReplyIndex: number

  // 回帖的楼层数，从 1 开始
  // 这里补充解释：帖子的 index 是递增的，可以当做帖子的顺序
  //              但是因为回帖的 index 是全局递增的，所以在单个帖子中就不是递增的了，需要单独维护一个字段
  floorIndex: number
}

/**
 * 话题的回帖的评论 Schema
 */
export interface XTopicReplyCommentSchema extends XTopicItemSchema {
  // 这个回帖的评论从哪个帖子开始
  postIndex: number

  // 回复的是哪条评论
  replyUUID: number

  // 回帖的评论的楼层数，从 1 开始
  floorIndex: number
}

/**
 * 话题的发帖 Schema
 */
export interface XTopicPostSchema extends XTopicItemSchema {
  /* ********************************************** 内容部分 *************************************************** */

  // 标题
  // 针对回答是没有 title 的
  title: string

  /* ********************************************** 元信息部分 *************************************************** */

  // 板块分类
  category: string[]

  // 标签
  tags: string[]

  /* ********************************************** UGC 部分 *************************************************** */

  // 回复该贴的回帖 ID
  // 待定
  replyIdList: string[]

  // 浏览量，预留
  pv: number

  // 浏览量，预留，暂时做不到
  uv: number

  // 最后回复时间
  lastRepliedAt: Date

  // 热度
  // 热度是一个单独的字段，方便运营者后期更改
  // 这里目前遗留一个小问题，就是更改了热度之后，可能下次更新的时候又被刷回去了
  heat: number

  // 如果是从博客导入的，会有一个这个字段作为标志
  blogName?: string
}

/**
 * 话题的发帖的草稿箱
 */
export interface XTopicPostDraftSchema extends XTopicItemSchema {
  draftSaveTime: string
}
