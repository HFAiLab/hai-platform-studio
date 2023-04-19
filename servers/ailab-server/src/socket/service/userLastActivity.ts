import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import { CLUSTER_REDIS_KEYS } from '../../config'
import { FetalErrorTypes, serverMonitor } from '../../monitor'
import { clusterRedisConn } from '../../redis'
import { GlobalPromiseSingletonExecuter } from '../../utils/promise'

export interface RecentUser {
  /**
   * 最后活跃的时间戳，秒
   */
  ts: number
  /**
   * 用户名
   */
  user_name: string
}

export class UserLastActivity {
  recentUsers: RecentUser[] = []

  lastSyncTime: number | null = null

  interval: 1000

  syncClusterUserLastActivityFromRedis = async () => {
    const redis = await clusterRedisConn.getClient()
    const recentUsersStr = await redis.get(CLUSTER_REDIS_KEYS.cluster_user_last_activity_in_ns)
    if (!recentUsersStr) {
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.userLastActivityNotFound,
        content: `${CLUSTER_REDIS_KEYS.cluster_user_last_activity_in_ns} 查询不存在，可能会影响状态更新`,
      })
      return
    }
    this.recentUsers = JSON.parse(recentUsersStr) as RecentUser[]
  }

  async getRecentUsers() {
    if (!this.lastSyncTime || getUTC8TimeStamp() - this.lastSyncTime > this.interval) {
      await GlobalPromiseSingletonExecuter.execute(this.syncClusterUserLastActivityFromRedis)
    }
    return this.recentUsers
  }
}

export const GlobalUserLastActivity = new UserLastActivity()
