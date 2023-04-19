import type { XTopicContentType, XTopicLikeSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicLike extends Model<XTopicLikeSchema> implements XTopicLikeSchema {
  id: number

  contentType!: XTopicContentType

  itemIndex!: number

  itemUUID!: string

  username!: string

  likeCount!: number

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicLikeInit(sequelize: Sequelize) {
  XTopicLike.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      contentType: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      itemIndex: {
        type: HFDataTypes.INTEGER,
      },
      itemUUID: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      username: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      likeCount: {
        type: HFDataTypes.INTEGER,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_like',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
