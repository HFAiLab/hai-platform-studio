import type { IncomingHttpHeaders } from 'http'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { User } from '@hai-platform/shared'
import type { SingleUserInfoWithoutToken } from '@hai-platform/studio-schemas/lib/cjs/isomorph/user/info'
import type { TokenMixin, URLMixin } from '@hai-platform/studio-schemas/lib/cjs/socket'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import { GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES } from '../config'
import { GlobalApiServerClient } from '../req/apiServer'
import { GlobalPromiseSingletonExecuter } from '../utils/promise'
import { logger } from './logger'
import { MemoryCacheManager } from './memoryCache'
import { findUserByName } from './users'

// 这里只存 token 到 name 的映射，很难变更
const userNameMemoryCache = new MemoryCacheManager<string, string>({
  expireTime: 12 * ONEHOUR, // 适当延长缓存，减少一些请求
})

export const genGetUserPromise = (token: string) => {
  return GlobalApiServerClient.request(ApiServerApiName.GET_USER, {
    token,
  })
}

export const convertUserToSingleUserInfoWithoutToken = (user: User): SingleUserInfoWithoutToken => {
  return {
    user_name: user.user_name,
    shared_group: user.shared_group,
    user_shared_group: user.shared_group,
    group_list: user.user_groups,
    user_group: user.user_groups,
    role: user.role,
    nick_name: user.nick_name,
  }
}

export async function getUserInfo(
  token: string,
  headers?: IncomingHttpHeaders,
): Promise<SingleUserInfoWithoutToken | null> {
  try {
    if (headers && headers['x-custom-host'] && headers['x-custom-mars-server']) {
      const userInfo = await GlobalApiServerClient.request(
        ApiServerApiName.GET_USER,
        {
          token: `${token}`,
        },
        {
          baseURL: `${headers['x-custom-mars-server']}`,
          headers: {
            Host: `${headers['x-custom-host']}`,
          },
        },
      )
      logger.info(`getUserInfo, in debug, res:`, userInfo)
      return userInfo
    }

    const begin = Date.now()
    const cache_user_name = userNameMemoryCache.get(token)
    if (cache_user_name) {
      // 优先从全局的用户信息里面拿，减少 get_user_info 的请求
      const user_info = await findUserByName(cache_user_name)
      if (user_info) {
        return convertUserToSingleUserInfoWithoutToken(user_info)
      }
    }
    const user = await GlobalPromiseSingletonExecuter.execute(
      genGetUserPromise,
      [token],
      `${GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.get_user_info_prefix}_${token}`,
    )
    userNameMemoryCache.set(token, user.user_name)
    logger.info(`[getUserInfo] cost: ${Date.now() - begin}, user: ${user.user_name}, ${user}`)
    return user
  } catch (e) {
    return null
  }
}

export async function ifAuth(auth: TokenMixin & URLMixin) {
  try {
    let userInfo
    if (auth.marsServerHost && auth.marsServerURL) {
      userInfo = await GlobalApiServerClient.request(
        ApiServerApiName.GET_USER,
        {
          token: auth.token,
        },
        {
          baseURL: auth.marsServerURL,
          headers: {
            Host: auth.marsServerHost,
          },
        },
      )
    } else {
      userInfo = await getUserInfo(auth.token)
    }
    return !!userInfo
  } catch (e) {
    console.error('error:', e)
    return false
  }
}
