import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../schema'

// These are all the attributes in the User model
export interface AppVersionAttributes {
  id?: number
  app_name: string
  base_app_version: string
  latest_app_version: string
  createdAt?: Date
  updatedAt?: Date
}

export class AppVersion extends Model<AppVersionAttributes> implements AppVersionAttributes {
  id: number

  updatedAt!: Date

  createdAt!: Date

  app_name!: string

  base_app_version!: string

  latest_app_version!: string
}

export function AppVersionInit(sequelize: Sequelize) {
  AppVersion.init(
    {
      id: {
        type: HFDataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      updatedAt: {
        type: HFDataTypes.DATE_NO_TZ,
      },
      app_name: {
        type: HFDataTypes.TEXT,
        allowNull: false,
      },
      base_app_version: {
        type: HFDataTypes.TEXT,
      },
      latest_app_version: {
        type: HFDataTypes.TEXT,
      },
    },
    {
      tableName: 'app_versions',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
