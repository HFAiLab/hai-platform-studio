import type { copyWriting } from '@hai-platform/i18n'
import { Languages, i18n } from '@hai-platform/i18n'
import { CONSTS } from '../consts'

export function getCurrentLanguage(): Languages {
  const preferLan = localStorage.getItem(CONSTS.HFAPP_AILAB_LAN_LOCALSTORAGE) as Languages
  if (preferLan && Object.values(Languages).includes(preferLan)) {
    return preferLan as Languages
  }

  // @ts-expect-error because userLanguage should exist
  let navLan = navigator.language || navigator.userLanguage
  if (navLan) navLan = navLan.substr(0, 2)

  if (navLan === 'zh') return Languages.ZH_CN
  return Languages.EN
}

export function setCurrentLanguage(lanType: Languages) {
  localStorage.setItem(CONSTS.HFAPP_AILAB_LAN_LOCALSTORAGE, lanType)
  i18n.setLanguage(lanType)
}

export function t(key: keyof typeof copyWriting, params?: Record<string, string>): string {
  // hint: 强行转一下
  return i18n.t(key as keyof typeof copyWriting, params)
}
