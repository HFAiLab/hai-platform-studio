import type { XTopicReportInsertBody } from '@hai-platform/client-ailab-server'
import type { Sequelize } from 'sequelize'
import { XTopicReport, XTopicReportInit } from '../../models/xtopic/Report'

export class XTopicReportController {
  constructor(sequelize: Sequelize) {
    XTopicReportInit(sequelize)
  }

  async list() {
    const itemList = await XTopicReport.findAll({
      order: [['createAt', 'desc']],
    })
    return itemList
  }

  async insert(option: XTopicReportInsertBody) {
    // @ts-expect-error because 暂时宽松处理
    const basicItem = await XTopicReport.build(option)
    await basicItem.save()
    return basicItem
  }
}
