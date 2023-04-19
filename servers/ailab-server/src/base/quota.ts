import type { GetAllUserNodeQuotaResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { TotalUserNodeUsedQuota } from '@hai-platform/shared'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import {
  CLUSTER_REDIS_KEYS,
  GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES,
  GlobalConfig,
} from '../config'
import { clusterRedisConn } from '../redis'
import { GlobalApiServerClient } from '../req/apiServer'
import { GlobalPromiseSingletonExecuter } from '../utils/promise'
import { logger } from './logger'
import type { MemoryRedisCacheData } from './memoryCache'
import { MemoryCacheManager, MemoryRedisCacheManager } from './memoryCache'

// Total 缓存
const USERS_ALL_QUOTA_CACHE_KEY = 'USERS_ALL_QUOTA_CACHE_KEY'

const GlobalAllUserQuotaMap = new MemoryRedisCacheManager<string, GetAllUserNodeQuotaResult>({
  checkInterval: 10 * 1000,
  forceCacheTime: 12 * ONEHOUR,
  redisChecker: async (
    key: string,
    data: MemoryRedisCacheData<GetAllUserNodeQuotaResult>,
  ): Promise<boolean> => {
    if (key === USERS_ALL_QUOTA_CACHE_KEY) {
      const clusterRedis = await clusterRedisConn.getClient()

      const lastUpdateTime = Math.floor(
        Number(await clusterRedis.get(CLUSTER_REDIS_KEYS.all_user_quota_last_update_time)) / 1e6,
      )

      // 这个时间戳是完全后端控制的，其实主要只判断相等就行了
      return data.lastCheckTime >= lastUpdateTime
    }

    return false
  },
})

const getAllUserQuotaFromRemote = async () => {
  logger.info(`quota getAllUserQuotaFromRemote`)
  const allUserTotalQuota = await GlobalApiServerClient.request(
    ApiServerApiName.GET_ALL_USER_NODE_QUOTA,
    {
      token: GlobalConfig.BFF_ADMIN_TOKEN,
    },
  )
  return allUserTotalQuota
}

const getUsersTotalFromRemoteOrCache = async (
  force?: boolean,
): Promise<GetAllUserNodeQuotaResult> => {
  if (!force) {
    const cacheInfo = await GlobalAllUserQuotaMap.get(USERS_ALL_QUOTA_CACHE_KEY)
    if (cacheInfo) return cacheInfo
  }

  const clusterRedis = await clusterRedisConn.getClient()

  const lastUpdateTime = Math.floor(
    Number(await clusterRedis.get(CLUSTER_REDIS_KEYS.all_user_quota_last_update_time)) / 1e6,
  )

  const usersAllQuota = await GlobalPromiseSingletonExecuter.execute(
    getAllUserQuotaFromRemote,
    [],
    GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.get_all_user_quota,
  )
  GlobalAllUserQuotaMap.set(USERS_ALL_QUOTA_CACHE_KEY, usersAllQuota, lastUpdateTime)

  return usersAllQuota
}

// used 缓存
const USERS_USED_QUOTA_CACHE_KEY = 'USERS_USED_QUOTA_CACHE_KEY'

const GlobalUserUsedQuotaMemoryCache = new MemoryCacheManager<string, TotalUserNodeUsedQuota>({
  expireTime: 5 * 1000, // 适当延长缓存，减少一些请求
})

const getUserUsedQuotaFromRemoteOrCache = async (
  force?: boolean,
): Promise<TotalUserNodeUsedQuota> => {
  if (!force) {
    const cacheInfo = GlobalUserUsedQuotaMemoryCache.get(USERS_USED_QUOTA_CACHE_KEY)
    if (cacheInfo) return cacheInfo
  }

  const clusterRedis = await clusterRedisConn.getClient()

  const allUserUsedQuota = JSON.parse(
    (await clusterRedis.get(CLUSTER_REDIS_KEYS.cluster_all_user_used_quota)) || `{"data":{}}`,
  ) as { data: TotalUserNodeUsedQuota }
  GlobalUserUsedQuotaMemoryCache.set(USERS_USED_QUOTA_CACHE_KEY, allUserUsedQuota.data)
  return allUserUsedQuota.data
}

const getUserTotalAndUsed = async (force?: boolean) => {
  const [total, used] = await Promise.all([
    getUsersTotalFromRemoteOrCache(force),
    getUserUsedQuotaFromRemoteOrCache(force),
  ])
  return { total, used }
}

export const getSingleUserQuota = async (user_name: string, force?: boolean) => {
  const usersAllQuota = await getUserTotalAndUsed(force)

  return {
    total: usersAllQuota.total[user_name] || { node: {}, node_limit: {}, node_limit_extra: {} },
    used: usersAllQuota.used[user_name] || {},
  }
}
