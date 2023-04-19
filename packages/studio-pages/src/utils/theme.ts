export function getNameSpace() {
  try {
    return process.env.BLUEPRINT_NAMESPACE
  } catch (e) {
    return 'hai-ui'
  }
}

export const DARK_THEME_KEY = 'JupyterLab Dark'

export function getDarkNameSpace() {
  return `${getNameSpace()}-dark`
}

export function getThemeClassName(currentTheme: string) {
  return currentTheme === 'JupyterLab Dark' ? getDarkNameSpace() : ''
}

// hint: jupyter 里面是 JupyterLab studio 里面直接是叫 dark
export function isDarkTheme(theme: string) {
  return theme === DARK_THEME_KEY || theme === 'dark'
}
