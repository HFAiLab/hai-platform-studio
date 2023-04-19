import { XTopicUser } from '../../orm/models/xtopic/User'

const MIN_SYNC_INTERVAL = 1000

export class XTopicUserInfoManager {
  lastSyncTime: number | null = null

  userInfoMap: Map<string, XTopicUser> = new Map()

  // hint: 注意，出于性能考虑，需要手动调调用，并且需要初始化 Sequelize 之后调用
  async syncFromDB() {
    if (this.lastSyncTime && Date.now() - this.lastSyncTime < MIN_SYNC_INTERVAL) return

    this.lastSyncTime = Date.now()
    const userList = await XTopicUser.findAll({})

    for (const user of userList) {
      this.userInfoMap.set(user.platformName, user)
    }
  }

  ifUserExist(platformName: string) {
    return !!this.userInfoMap.get(platformName)
  }

  // 这里不使用 async，是为了加速
  // 这样带来的缺点就是 syncFromDB 手动调用
  getNickNameByUserName(platformName: string) {
    const userInfo = this.userInfoMap.get(platformName)

    if (!userInfo) return null

    return userInfo.nickname
  }

  getUserInfoByUserName(platformName: string) {
    // console.log('userInfoMap:', this.userInfoMap, platformName)
    const userInfo = this.userInfoMap.get(platformName)

    // console.log('userInfo:', userInfo)
    if (!userInfo) return null

    return userInfo
  }

  async getAllXtopicUser() {
    await this.syncFromDB()
    return new Set(this.userInfoMap.keys())
  }
}

export const GlobalXTopicUserInfoManager = new XTopicUserInfoManager()
