import type { XTopicReplySchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicReply extends Model<XTopicReplySchema> implements XTopicReplySchema {
  index!: number

  uuid!: string

  title!: string

  content!: string

  author!: string

  editorList!: string[]

  editorTimeList!: string[]

  category!: string

  tags!: string[]

  pin!: number

  visible!: boolean

  deleted!: boolean

  locked!: boolean

  locked_reply!: boolean

  likeCount!: number

  postIndex!: number

  referReplyIndex!: number

  floorIndex!: number

  updatedAt!: Date

  createdAt!: Date
}

export function XTopicReplyInit(sequelize: Sequelize) {
  XTopicReply.init(
    {
      index: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: HFDataTypes.TEXT,
      },
      content: {
        type: HFDataTypes.TEXT,
      },
      author: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      editorList: {
        type: HFDataTypes.ARRAY(HFDataTypes.STRING),
        defaultValue: [],
      },
      editorTimeList: {
        type: HFDataTypes.ARRAY(HFDataTypes.STRING),
        defaultValue: [],
      },
      pin: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      visible: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: false,
      },
      locked: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: false,
      },
      locked_reply: {
        type: HFDataTypes.BOOLEAN,
        defaultValue: false,
      },
      likeCount: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      postIndex: {
        type: HFDataTypes.INTEGER,
      },
      referReplyIndex: {
        type: HFDataTypes.INTEGER,
      },
      floorIndex: {
        type: HFDataTypes.INTEGER,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      name: {
        plural: 'replies',
      },
      tableName: 'topic_reply',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
