export interface XTopicCategorySchema {
  id: number

  // 分类名
  name: string

  // 分类描述
  description: string

  // 顺序，可以暂定大的在前面
  order: number

  updatedAt: Date

  createdAt: Date
}
