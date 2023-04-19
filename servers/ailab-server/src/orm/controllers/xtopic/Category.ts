import type { XTopicCategoryInsertBody } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { XTopicCategory, XTopicCategoryInit } from '../../models/xtopic/Category'

export class XTopicCategoryController {
  constructor(sequelize: Sequelize) {
    XTopicCategoryInit(sequelize)
  }

  async list() {
    const itemList = await XTopicCategory.findAll({
      order: [['order', 'desc']],
    })
    return itemList
  }

  async insert(option: XTopicCategoryInsertBody) {
    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicReply.build(option)
    await basicItem.save()
    return basicItem
  }
}
