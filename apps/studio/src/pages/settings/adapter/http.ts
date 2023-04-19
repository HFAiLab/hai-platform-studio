import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { GlobalAilabServerClient } from '../../../api/ailabServer'
import { conn } from '../../../api/serverConnection'
import type { AppConfigSchema } from '../../../modules/settings/config'
import { SettingParser } from '../../../modules/settings/parser'
import { LevelLogger, getUserName } from '../../../utils'
import type { SettingsAdapter } from '../schema'

export class HttpStorageAdapter implements SettingsAdapter {
  async getUserSettings(): Promise<Partial<AppConfigSchema>> {
    const settings = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_GET_CONFIG_TEXT,
      undefined,
      {
        method: 'GET',
      },
    )
    try {
      return SettingParser.parse(settings || '{}')
    } catch (e) {
      LevelLogger.info(`HttpStorageAdapter getUserSettings error: ${e}`)
      return {}
    }
  }

  async setUserSettings(token: string, settings: string) {
    const res = await conn.setUserSettings({
      userName: getUserName()!,
      config: settings,
    })

    return res
  }
}

export const httpStorageAdapter = new HttpStorageAdapter()
