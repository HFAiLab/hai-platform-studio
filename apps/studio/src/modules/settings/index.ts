import { useEffect, useState } from 'react'
// import { localStorageAdapter } from '../../pages/settings/adapter/localStorage';
import { httpStorageAdapter } from '../../pages/settings/adapter/http'
import { getToken } from '../../utils'
import type { AppConfigSchema } from './config'
import { SettingParser } from './parser'

let globalUserSettings: Partial<AppConfigSchema> | null = null

export async function getCombineSettingsLazy() {
  const userSettings = globalUserSettings || (await httpStorageAdapter.getUserSettings())
  globalUserSettings = userSettings
  const combineSettings = { ...SettingParser.defaultSettingsContent, ...userSettings }

  return {
    userSettings,
    combineSettings,
  }
}

// 因为这个版本是直接同步读取的，所以可能是不安全的，因此尽量不要在初始化阶段使用这个函数
export function getCombineSettingsUnsafe() {
  const combineSettings = {
    ...SettingParser.defaultSettingsContent,
    ...globalUserSettings,
  } as AppConfigSchema

  return {
    userSettings: globalUserSettings as AppConfigSchema,
    combineSettings,
  }
}

export async function updateUserSettings(settings: string) {
  globalUserSettings = JSON.parse(settings)
  const result = await httpStorageAdapter.setUserSettings(getToken(), settings)
  return result
}

export function useSettings() {
  const [combineSettings, setCombineSettings] = useState<AppConfigSchema | null>(null)
  const [userSettingsString, setUserSettingsString] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const defaultSettingsText = SettingParser.renderDefault()

  useEffect(() => {
    getCombineSettingsLazy().then(({ userSettings, combineSettings: combined }) => {
      setUserSettingsString(JSON.stringify(userSettings, null, 4))
      setCombineSettings(combined)
      setIsLoading(false)
    })
  }, [])

  return {
    defaultSettingsText,
    defaultSettings: SettingParser.defaultSettingsContent,
    combineSettings,
    userSettingsString,
    setUserSettingsString,
    saveUserSettings: (settings: string) => {
      return updateUserSettings(settings)
    },
    isLoading,
  }
}
