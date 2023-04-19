import type { XTopicTopTagInsertBody } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { XTopicTopTag, XTopicTopTagInit } from '../../models/xtopic/TopTag'

export class XTopicTopTagController {
  constructor(sequelize: Sequelize) {
    XTopicTopTagInit(sequelize)
  }

  async list() {
    const itemList = await XTopicTopTag.findAndCountAll({
      order: [['order', 'desc']],
    })
    return itemList
  }

  async insert(option: XTopicTopTagInsertBody) {
    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicTopTag.build(option)
    await basicItem.save()
    return basicItem
  }
}
