// 自动发送【自定义】消息的触发器
// 首次登陆的

// 触发器表：
// 	id  -> sourceIndex
// 	content :string
// 	triggerCount: number
// 	receiver: __internal, __external, [<userName>,...]
//  triggerEvent: string 触发时机
//  triggerMultiple: boolean 是否允许触发多次
// 	CreatedAt: Date
// 	addBy	: string
// 	expires: Date
// 	enabled: boolean

import type { XTopicNotificationTriggerSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicNotificationTrigger
  extends Model<XTopicNotificationTriggerSchema>
  implements XTopicNotificationTriggerSchema
{
  index: number

  content!: string

  triggerCount!: number

  receiver!: string

  addBy!: string

  triggerEvent!: string

  triggerMultiple!: boolean

  expires!: Date

  enabled!: boolean

  createdAt: Date

  deleted: boolean
}

export function XTopicNotificationTriggerInit(sequelize: Sequelize) {
  XTopicNotificationTrigger.init(
    {
      index: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      triggerCount: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      receiver: {
        type: HFDataTypes.STRING,
      },
      addBy: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      enabled: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: true,
      },
      expires: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      triggerEvent: {
        type: HFDataTypes.TEXT,
      },
      triggerMultiple: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      deleted: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'topic_notification_trigger',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
