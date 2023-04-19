import type { Sequelize } from 'sequelize'
import { Model } from 'sequelize'
import { HFDataTypes } from '../schema'

// These are all the attributes in the User model
interface UserAttributes {
  user_name: string
  config_json_text: string
  createdAt?: Date
  updatedAt?: Date
}

export class UserConfig extends Model<UserAttributes> implements UserAttributes {
  updatedAt!: Date

  createdAt!: Date

  user_name!: string

  config_json_text!: string
}

export function UserConfigInit(sequelize: Sequelize) {
  UserConfig.init(
    {
      user_name: {
        type: HFDataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
      },
      config_json_text: {
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
      tableName: 'user_configs',
      schema: 'frontend',
      freezeTableName: true,
      sequelize, // passing the `sequelize` instance is required
    },
  )
}
