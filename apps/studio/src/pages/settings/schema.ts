import type { AppConfigSchema } from '../../modules/settings/config'

export interface SettingsAdapter {
  getUserSettings(): Promise<Partial<AppConfigSchema>>
  setUserSettings(token: string, settings: string): Promise<boolean>
}
