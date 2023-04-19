export const isFirefox = navigator.userAgent.indexOf('Firefox') > -1

/**
 * 获取 Chrome 浏览器的版本
 */
export function getChromeVersion() {
  const arr = navigator.userAgent.split(' ')
  let chromeVersion = ''
  for (let i = 0; i < arr.length; i += 1) {
    if (/chrome/i.test(arr[i] || '')) chromeVersion = arr[i] || ''
  }
  if (chromeVersion) {
    return Number(chromeVersion.split('/')[1]?.split('.')[0])
  }
  return false
}

function getVersion(userAgent: string, reg: string) {
  const reBrowser = new RegExp(reg)
  reBrowser.test(userAgent)
  // eslint-disable-next-line @typescript-eslint/dot-notation
  return parseFloat(RegExp['$1'])
}

/**
 * 获取主流浏览器的类型和版本
 */
export function getUserAgentInfo() {
  const { userAgent } = navigator
  let version
  if (/opera/i.test(userAgent) || /OPR/i.test(userAgent)) {
    version = getVersion(userAgent, 'OPR/(\\d+\\.+\\d+)')
    return `Opera-${version}`
  }
  if (/compatible/i.test(userAgent) && /MSIE/i.test(userAgent)) {
    version = getVersion(userAgent, 'MSIE (\\d+\\.+\\d+)')
    return `IE-${version}`
  }
  if (/Edge/i.test(userAgent)) {
    version = getVersion(userAgent, 'Edge/(\\d+\\.+\\d+)')
    return `Edge-${version}`
  }
  if (/Firefox/i.test(userAgent)) {
    version = getVersion(userAgent, 'Firefox/(\\d+\\.+\\d+)')
    return `Firefox-${version}`
  }
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    version = getVersion(userAgent, 'Safari/(\\d+\\.+\\d+)')
    return `Safari-${version}`
  }
  if (/Chrome/i.test(userAgent) && /Safari/i.test(userAgent)) {
    version = getVersion(userAgent, 'Chrome/(\\d+\\.+\\d+)')
    return `Chrome-${version}`
  }
  // @ts-expect-error old IE
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    version = 11
    return `IE-${version}`
  }
  return 'unknown'
}
