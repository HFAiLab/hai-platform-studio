import type { Sequelize } from 'sequelize'
import { UserConfig, UserConfigInit } from '../models/UserConfig'

export class UserConfigController {
  constructor(sequelize: Sequelize) {
    UserConfigInit(sequelize)
  }

  async updateUserConfig(userName: string, config: string) {
    let user = await UserConfig.findOne({
      where: {
        user_name: userName,
      },
    })
    if (!user) {
      user = UserConfig.build({ user_name: userName, config_json_text: config })
    }
    user.config_json_text = config
    return user.save()
  }

  async getUserConfig(userName: string) {
    const user = await UserConfig.findOne({
      where: {
        user_name: userName,
      },
    })
    if (!user) {
      return {}
    }
    return user.get('config_json_text')
  }
}
