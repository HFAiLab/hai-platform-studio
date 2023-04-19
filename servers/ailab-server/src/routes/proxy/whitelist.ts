import type urllib from 'url'
import { getProxyWhiteList } from '@hai-platform/shared'
import { logger } from '../../base/logger'
import { GlobalConfig, isPrePub, isProd } from '../../config'

const WhiteListConfig = getProxyWhiteList()

type WhiteListConfigKeys = keyof typeof WhiteListConfig

const enableWhiteListCheck = isProd() && !isPrePub()

export function judgeInWhiteList(url: urllib.URL) {
  if (!enableWhiteListCheck) return true

  if (!(url.host in WhiteListConfig)) {
    // 我们默认认为可以代理 server 的全部接口
    if (GlobalConfig.CLUSTER_SERVER_URL && GlobalConfig.CLUSTER_SERVER_URL.includes(url.host))
      return true

    logger.error('[proxy error] not in whitelist:', url.host, url.pathname)
    return false
  }
  const checkerConfig = WhiteListConfig[url.host as WhiteListConfigKeys]
  return !!checkerConfig?.checker(url)
}

export function judgeAlertIgnore(url: string) {
  if (/\/ugc\/list_cluster_files/.test(url)) return true
  return false
}
