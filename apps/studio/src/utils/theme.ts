import { CONSTS } from '../consts'
import { WebEventsKeys, hfEventEmitter } from '../modules/event'

export enum Themes {
  light = 'light',
  dark = 'dark',
}

function updateBodyTheme(theme: Themes) {
  if (theme === Themes.dark) {
    document.body.classList.add('hai-ui-dark')
  } else {
    document.body.classList.remove('hai-ui-dark')
  }
}

export function getCurrentTheme(): Themes {
  const preferTheme = localStorage.getItem(CONSTS.HFAPP_AILAB_THEME_LOCALSTORAGE) as Themes
  if (preferTheme && Object.values(Themes).includes(preferTheme)) return preferTheme as Themes

  return Themes.light
}

export function setCurrentTheme(theme: Themes) {
  updateBodyTheme(theme)
  localStorage.setItem(CONSTS.HFAPP_AILAB_THEME_LOCALSTORAGE, theme)
  hfEventEmitter.emit(WebEventsKeys.themeChange, {
    newTheme: theme,
  })
}

export function isDarkTheme() {
  return getCurrentTheme() === Themes.dark
}

export function initTheme() {
  updateBodyTheme(getCurrentTheme())
}
