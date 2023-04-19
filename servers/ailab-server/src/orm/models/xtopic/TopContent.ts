import type { XTopicTopContentSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicTopContent
  extends Model<XTopicTopContentSchema>
  implements XTopicTopContentSchema
{
  id: number

  link!: string

  image!: string

  title!: string

  description!: string

  order!: number

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicTopContentInit(sequelize: Sequelize) {
  XTopicTopContent.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      link: {
        type: HFDataTypes.TEXT,
      },
      image: {
        type: HFDataTypes.TEXT,
      },
      title: {
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
      tableName: 'topic_top_content',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
