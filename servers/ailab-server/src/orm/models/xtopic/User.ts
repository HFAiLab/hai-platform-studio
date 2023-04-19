import type { XTopicUserSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicUser extends Model<XTopicUserSchema> implements XTopicUserSchema {
  id: number

  platformName!: string

  nickname!: string

  avatar!: string

  bio!: string

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicUserInit(sequelize: Sequelize) {
  XTopicUser.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      platformName: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      nickname: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      avatar: {
        type: HFDataTypes.TEXT,
      },
      bio: {
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
      tableName: 'topic_user',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
