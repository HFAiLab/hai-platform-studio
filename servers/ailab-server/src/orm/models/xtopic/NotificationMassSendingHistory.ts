// 自动触发

// 触发器表：
// 	id  -> sourceIndex
// 	content :string
// 	triggerCount: number
// 	receiver: __internal, __external, [<userName>,...]
// 	CreatedAt: Date
// 	addBy	: string
// 	expires: Date
// 	enabled: boolean

import type { XTopicNotificationMassSendingHistorySchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicNotificationMassSendingHistory
  extends Model<XTopicNotificationMassSendingHistorySchema>
  implements XTopicNotificationMassSendingHistorySchema
{
  id!: number

  content!: string

  messageCount!: number

  sender!: string

  receiver!: string

  notes!: string

  createdAt!: Date
}

export function XTopicNotificationMassSendingHistoryInit(sequelize: Sequelize) {
  XTopicNotificationMassSendingHistory.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      messageCount: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      sender: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      receiver: {
        type: HFDataTypes.STRING,
      },
      notes: {
        type: HFDataTypes.STRING,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'topic_notification_mass_sending_history',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
