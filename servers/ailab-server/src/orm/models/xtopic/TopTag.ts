import type { XTopicTopTagSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicTopTag extends Model<XTopicTopTagSchema> implements XTopicTopTagSchema {
  id: number

  name!: string

  description!: string

  order!: number

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicTopTagInit(sequelize: Sequelize) {
  XTopicTopTag.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: HFDataTypes.TEXT,
      },
      order: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_top_tag',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
