import type {
  XTopicNotificationSchema,
  XTopicNotificationSourceType,
  XTopicNotificationType,
} from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicNotification
  extends Model<XTopicNotificationSchema>
  implements XTopicNotificationSchema
{
  index!: number

  notifier!: string

  actor!: string

  sourceType!: XTopicNotificationSourceType

  sourceIndex!: number

  postIndex!: number

  aggregateCount!: number

  type!: XTopicNotificationType

  read!: boolean

  trash!: boolean

  aggregate!: boolean

  content!: string

  lastUpdatedAt!: Date

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicNotificationInit(sequelize: Sequelize) {
  XTopicNotification.init(
    {
      index: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notifier: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      actor: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      sourceType: {
        type: HFDataTypes.TEXT,
      },
      sourceIndex: {
        type: HFDataTypes.INTEGER,
      },
      postIndex: {
        type: HFDataTypes.INTEGER,
      },
      aggregateCount: {
        type: HFDataTypes.INTEGER,
      },
      type: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },

      read: {
        type: HFDataTypes.BOOLEAN,
        allowNull: false,
      },

      trash: {
        type: HFDataTypes.BOOLEAN,
        allowNull: false,
      },

      aggregate: {
        type: HFDataTypes.BOOLEAN,
        allowNull: false,
      },

      content: {
        type: HFDataTypes.TEXT,
      },

      lastUpdatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },

      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },

      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_notification',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
