import type {
  XTopicNotificationSourceType,
  XTopicNotificationTemplateSchema,
  XTopicNotificationType,
} from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicNotificationTemplate
  extends Model<XTopicNotificationTemplateSchema>
  implements XTopicNotificationTemplateSchema
{
  description!: string

  type!: XTopicNotificationType

  sourceType!: XTopicNotificationSourceType

  aggregate!: boolean

  content!: string

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicNotificationTemplateInit(sequelize: Sequelize) {
  // 通知模板表使用的是 type+aggregate 的组合 key
  XTopicNotificationTemplate.init(
    {
      description: {
        type: HFDataTypes.TEXT,
      },
      type: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      sourceType: {
        type: HFDataTypes.TEXT,
      },
      aggregate: {
        type: HFDataTypes.BOOLEAN,
        allowNull: false,
        primaryKey: true,
      },

      content: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },

      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },

      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_notification_template',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
