import fs from 'fs/promises'
import path from 'path'
import type { HaiConfig } from '@hai-platform/shared'
import { logger } from '../../base/logger'
import { GlobalConfig } from '../../config'

class HaiHTMLManager {
  htmlCache: Map<string, string> = new Map()

  addFileChangeWatch = async (filePath: string) => {
    const ac = new AbortController()
    const { signal } = ac
    try {
      const watcher = fs.watch(filePath, { signal })
      for await (const event of watcher) {
        logger.info(`watch ${filePath} get event:`, event)
        this.htmlCache.delete(filePath)
        ac.abort()
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      throw err
    }
  }

  getHaiConfig = () => {
    return {
      schedulerDefaultGroup: GlobalConfig.SCHEDULER_DEFAULT_GROUP,
      schedulerErrorNodeMetaGroup: GlobalConfig.SCHEDULER_ERROR_NODE_META_GROUP,
      jupyterSharedNodeGroupPrefix: GlobalConfig.JUPYTER_SHARED_NODE_GROUP_PREFIX,
      bffURL: GlobalConfig.BFF_URL,
      wsURL: GlobalConfig.WS_URL,
      jupyterURL: GlobalConfig.STUDIO_JUPYTER_URL,
      clusterServerURL: GlobalConfig.CLUSTER_SERVER_URL,
      countly: {
        apiKey: GlobalConfig.STUDIO_COUNTLY_API_KEY,
        url: GlobalConfig.STUDIO_COUNTLY_URL,
      },
    } as HaiConfig
  }

  // 给 studio 增加一个全局配置
  replaceStudioConfig = (fileContent: string): string => {
    return fileContent.replace(
      `<script>/* studio_config_json_script */</script>`,
      `<script>window.haiConfig = ${JSON.stringify(this.getHaiConfig())}</script>`,
    )
  }

  // 给 monitor 增加一个全局配置
  replaceMonitorConfig = (fileContent: string): string => {
    return fileContent.replace(
      `<script>/* monitor_config_json_script */</script>`,
      `<script>window.haiConfig = ${JSON.stringify(this.getHaiConfig())}</script>`,
    )
  }

  renderRootHTML = async (file: string, fileType: 'studio' | 'monitor') => {
    const filePath = path.join(__dirname, `../../../public/${file}`)

    if (this.htmlCache.has(filePath)) {
      return this.htmlCache.get(filePath) as string
    }

    logger.info('renderRootHTML:', filePath)
    let fileContent = await fs.readFile(filePath, 'utf-8')

    if (fileType === 'studio') fileContent = this.replaceStudioConfig(fileContent)
    if (fileType === 'monitor') fileContent = this.replaceMonitorConfig(fileContent)

    this.htmlCache.set(filePath, fileContent)
    this.addFileChangeWatch(filePath)
    return fileContent
  }
}

export const GlobalHaiHTMLManager = new HaiHTMLManager()
