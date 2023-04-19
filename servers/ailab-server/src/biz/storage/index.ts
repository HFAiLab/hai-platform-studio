import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { ExternalStorageUsage } from '@hai-platform/shared'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import { logger } from '../../base/logger'
import { MemoryCacheManager } from '../../base/memoryCache'
import { GlobalConfig } from '../../config'
import { GlobalApiServerClient } from '../../req/apiServer'

// 这里只存 token 到 name 的映射，很难变更
const externalUserStorageUsageCache = new MemoryCacheManager<string, ExternalStorageUsage>({
  expireTime: 2 * ONEMINUTE, // 适当延长缓存，减少一些请求
})

/**
 * 带有缓存的获取外部用户 storage usage
 * 和 servers/ailab-server/src/routes/studio-admin/externalStorage.ts 的区别：
 * 这个是给用户自己用的，那个是给管理员用的，会有一些额外的字段
 */
export const getUserStorageUsage = async (userName: string) => {
  const usageCache = externalUserStorageUsageCache.get(userName)
  if (!usageCache) {
    logger.info(`getUserStorageUsage for userName: ${userName}, cache not found`)
    const usageDict = await GlobalApiServerClient.request(
      ApiServerApiName.GET_EXTERNAL_USER_STORAGE_STAT,
      {
        token: GlobalConfig.BFF_ADMIN_TOKEN,
      },
    )
    for (const [name, userStorageUsage] of Object.entries(usageDict)) {
      externalUserStorageUsageCache.set(name, userStorageUsage)
    }
  }

  return externalUserStorageUsageCache.get(userName)
}
