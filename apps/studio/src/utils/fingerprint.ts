import { getUserName } from './hfaiToken'

export function getFingerprint() {
  const info = {
    userAgent: window.navigator.userAgent,
    href: window.location.hostname,
    user_name: getUserName(),
  }
  return window.btoa(JSON.stringify(info))
}
