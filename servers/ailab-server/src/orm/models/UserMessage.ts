import type { ClusterUserMessageSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../schema'

export class ClusterUserMessage
  extends Model<ClusterUserMessageSchema>
  implements ClusterUserMessageSchema
{
  messageId: number

  important: boolean

  type: 'normal' | 'warning' | 'danger' | 'success'

  title: string

  content: string

  detailContent: string

  date: Date

  detailText: string

  assigned_to: string

  expiry: Date
}

export function ClusterUserMessageInit(sequelize: Sequelize) {
  ClusterUserMessage.init(
    {
      messageId: {
        type: HFDataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      important: {
        type: HFDataTypes.BOOLEAN,
      },
      type: {
        type: HFDataTypes.BOOLEAN,
      },
      title: {
        type: HFDataTypes.STRING,
      },
      content: {
        type: HFDataTypes.STRING,
      },
      detailContent: {
        type: HFDataTypes.STRING,
      },
      date: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      detailText: {
        type: HFDataTypes.STRING,
      },
      assigned_to: {
        type: HFDataTypes.STRING,
      },
      expiry: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'message',
      schema: 'public',
      freezeTableName: true,
      timestamps: false,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
