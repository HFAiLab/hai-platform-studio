/** 集群用户信息相关 */
import type { GetUsersResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { User } from '@hai-platform/shared'
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
import { MemoryRedisCacheManager } from './memoryCache'

interface UserIDMap {
  [id: string]: User
}

interface UserNameMap {
  [name: string]: User
}

interface UsersInfoCache {
  list: GetUsersResult
  partial_map: UserIDMap
  name_map: UserNameMap
}

const USER_INFO_CACHE_KEY = 'USER_INFO_MAP'

const GlobalUsersInfoMap = new MemoryRedisCacheManager<string, UsersInfoCache>({
  checkInterval: 10 * 1000,
  forceCacheTime: 12 * ONEHOUR,
  redisChecker: async (
    key: string,
    data: MemoryRedisCacheData<UsersInfoCache>,
  ): Promise<boolean> => {
    if (key === USER_INFO_CACHE_KEY) {
      const clusterRedis = await clusterRedisConn.getClient()

      const lastUpdateTime = Math.floor(
        Number(await clusterRedis.get(CLUSTER_REDIS_KEYS.all_user_info_last_update_time)) / 1e6,
      )

      // 这个时间戳是完全后端控制的，其实主要只判断相等就行了
      return data.lastCheckTime >= lastUpdateTime
    }

    return false
  },
})

// hint: 这里可能就没多少请求，就不用 redis 级联缓存了，但是这个逻辑先保留着：eb637174
const getAllUsersFromRemote = async () => {
  logger.info('users getAllUsersFromRemote')
  const users = await GlobalApiServerClient.request(ApiServerApiName.GET_USERS, {
    token: GlobalConfig.BFF_ADMIN_TOKEN,
  })
  return users
}

// 刷新全部用户信息的缓存
export const getAllUsersFromRemoteOrCache = async (): Promise<UsersInfoCache> => {
  const cacheInfo = await GlobalUsersInfoMap.get(USER_INFO_CACHE_KEY)
  if (cacheInfo) return cacheInfo
  logger.info(`getAllUsersFromRemoteOrCache cache not found: ${USER_INFO_CACHE_KEY}`)

  const clusterRedis = await clusterRedisConn.getClient()

  const lastUpdateTime = Math.floor(
    Number(await clusterRedis.get(CLUSTER_REDIS_KEYS.all_user_info_last_update_time)) / 1e6,
  )

  const users = await GlobalPromiseSingletonExecuter.execute(
    getAllUsersFromRemote,
    [],
    GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.get_all_users_from_remote,
  )

  const partial_map = {} as UserIDMap
  const name_map = {} as UserNameMap

  if (users) {
    for (const u of users) {
      partial_map[u.user_id] = { ...u }
      name_map[u.user_name] = { ...u }
    }
  }
  logger.info(`set USER_INFO_CACHE_KEY lastUpdateTime: ${lastUpdateTime}`)
  GlobalUsersInfoMap.set(
    USER_INFO_CACHE_KEY,
    {
      list: users,
      partial_map,
      name_map,
    },
    lastUpdateTime,
  )
  return {
    list: users,
    partial_map,
    name_map,
  }
}

// 从 api-server 获取全部的用户，有 3 分钟的一个缓存
export const getAllUsers = async (onlyActive = true): Promise<GetUsersResult> => {
  try {
    const userList = (await getAllUsersFromRemoteOrCache()).list
    if (onlyActive) {
      return userList.filter((user) => user.active)
    }
    return userList
  } catch (e) {
    logger.error('base getAllUsers error:', e)
    return []
  }
}

// 根据 user_id 获取一些基本的用户信息
export async function findUserById(id: string): Promise<User | null> {
  try {
    const allUsers = await getAllUsersFromRemoteOrCache()
    return allUsers.partial_map[id] ?? null
  } catch (e) {
    logger.error('base findUserById error:', e)
    return null
  }
}

// 根据 user_name 获取一些基本的用户信息
export async function findUserByName(name: string): Promise<User | null> {
  try {
    const allUsers = await getAllUsersFromRemoteOrCache()
    return allUsers.name_map[name] ?? null
  } catch (e) {
    logger.error('base findUserById error:', e)
    return null
  }
}
