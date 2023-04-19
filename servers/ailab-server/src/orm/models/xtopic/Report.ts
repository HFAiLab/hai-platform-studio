import type { XTopicReportSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicReport extends Model<XTopicReportSchema> implements XTopicReportSchema {
  id: number

  contentType!: 'post' | 'reply' | 'comment'

  itemUUID!: string

  itemIndex!: number

  reason!: string

  submitter!: string

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicReportInit(sequelize: Sequelize) {
  XTopicReport.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      itemIndex: {
        type: HFDataTypes.INTEGER,
      },
      contentType: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      itemUUID: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      reason: {
        type: HFDataTypes.TEXT,
      },
      submitter: {
        type: HFDataTypes.TEXT,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_report',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
