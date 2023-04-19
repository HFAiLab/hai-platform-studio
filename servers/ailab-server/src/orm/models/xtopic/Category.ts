import type { XTopicCategorySchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicCategory extends Model<XTopicCategorySchema> implements XTopicCategorySchema {
  id: number

  name!: string

  description!: string

  order!: number

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicCategoryInit(sequelize: Sequelize) {
  XTopicCategory.init(
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
      tableName: 'topic_category',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
