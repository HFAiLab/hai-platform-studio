import type { LogUploadDetailAttributes, LogUploadRequestAttributes } from '@hai-platform/shared'
import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../schema'

export type { LogUploadDetailAttributes, LogUploadRequestAttributes } from '@hai-platform/shared'

export class LogUploadRequest
  extends Model<LogUploadRequestAttributes>
  implements LogUploadRequestAttributes
{
  channel!: string

  rid!: string

  uid!: string

  status!: string

  source!: string // 来源，主动上报或者被动的

  updatedAt!: Date

  createdAt!: Date
}

export class LogUploadDetail
  extends Model<LogUploadDetailAttributes>
  implements LogUploadDetailAttributes
{
  rid!: string // 对应 LogUploadRequestAttributes

  fingerprint!: string

  distpath!: string

  createdAt?: Date

  updatedAt?: Date
}

export function LogUploadInit(sequelize: Sequelize) {
  LogUploadRequest.init(
    {
      channel: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      rid: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      uid: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      status: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      source: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'log_upload_info',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )

  LogUploadDetail.init(
    {
      rid: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      fingerprint: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      distpath: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: false,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
    },
    {
      tableName: 'log_upload_detail',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )

  LogUploadRequest.hasMany(LogUploadDetail, {
    foreignKey: 'rid',
    as: 'details',
  })
}
