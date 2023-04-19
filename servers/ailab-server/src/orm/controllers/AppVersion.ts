import type { Sequelize } from 'sequelize'
import { AppVersion, AppVersionInit } from '../models/AppVersion'

export class AppVersionController {
  constructor(sequelize: Sequelize) {
    AppVersionInit(sequelize)
  }

  // eslint-disable-next-line class-methods-use-this
  async updateAppVersion(app_name: string, base_app_version: string, latest_app_version: string) {
    let user = await AppVersion.findOne({
      where: {
        app_name,
        base_app_version,
      },
    })
    if (!user) {
      user = AppVersion.build({ app_name, base_app_version, latest_app_version })
    }
    user.latest_app_version = latest_app_version
    return user.save()
  }

  // eslint-disable-next-line class-methods-use-this
  async getAppVersion(app_name: string, base_app_version: string) {
    const app = await AppVersion.findOne({
      where: {
        app_name,
        base_app_version,
      },
    })
    if (!app) {
      return null
    }
    return app.get('latest_app_version')
  }
}
