import type { Sequelize } from 'sequelize'
import { XTopicTopContent, XTopicTopContentInit } from '../../models/xtopic/TopContent'

export class XTopicTopContentController {
  constructor(sequelize: Sequelize) {
    XTopicTopContentInit(sequelize)
  }

  async list() {
    const itemList = await XTopicTopContent.findAll({
      order: [['order', 'desc']],
    })
    return itemList
  }
}
