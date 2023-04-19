/* eslint-disable require-await */
import { LevelLogger } from '@hai-platform/studio-toolkit/lib/esm'
import type { AppConfigSchema } from '../../../modules/settings/config'
import { SettingParser } from '../../../modules/settings/parser'
import { getToken } from '../../../utils'
import type { SettingsAdapter } from '../schema'

const LocalSettingsKey = 'ailab-web-settings-v1'

export class LocalStorageAdapter implements SettingsAdapter {
  // 这里是因为这个接口本身是 async 的，这里实现就也加一个 async
  // eslint-disable-next-line prettier/prettier
  async getUserSettings(): Promise<Partial<AppConfigSchema>> {
    const token = getToken()
    let settings = window.localStorage.getItem(`${LocalSettingsKey}:${token}`)
    if (!settings) {
      settings = '{}'
    }
    try {
      return SettingParser.parse(settings) as Partial<AppConfigSchema>
    } catch (e) {
      LevelLogger.info(`LocalStorageAdapter getUserSettings error: ${e}`)
      return {}
    }
  }

  async setUserSettings(token: string, settings: string) {
    window.localStorage.setItem(`${LocalSettingsKey}:${token}`, settings)
    return true
  }
}

export const localStorageAdapter = new LocalStorageAdapter()
