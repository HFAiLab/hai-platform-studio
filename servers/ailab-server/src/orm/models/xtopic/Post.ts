import type { XTopicPostSchema } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../../schema'

export class XTopicPost extends Model<XTopicPostSchema> implements XTopicPostSchema {
  index!: number

  uuid!: string

  title!: string

  content!: string

  author!: string

  editorList!: string[]

  editorTimeList!: string[]

  category!: string[]

  tags!: string[]

  pin!: number

  visible!: boolean

  deleted!: boolean

  locked!: boolean

  locked_reply!: boolean

  likeCount!: number

  replyIdList!: string[]

  pv!: number

  uv!: number

  lastRepliedAt!: Date

  heat!: number

  updatedAt!: Date

  createdAt!: Date

  blogName: string
}

export function XTopicPostInit(sequelize: Sequelize) {
  XTopicPost.init(
    {
      index: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: HFDataTypes.TEXT,
      },
      title: {
        type: HFDataTypes.TEXT,
        allowNull: false,
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
      category: {
        type: HFDataTypes.ARRAY(HFDataTypes.STRING),
        allowNull: false,
      },
      tags: {
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
      replyIdList: {
        type: HFDataTypes.ARRAY(HFDataTypes.STRING),
        defaultValue: [],
      },
      pv: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      uv: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      lastRepliedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      heat: {
        type: HFDataTypes.INTEGER,
        defaultValue: 0,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      blogName: {
        type: HFDataTypes.TEXT,
      },
    },
    {
      tableName: 'topic_post',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
