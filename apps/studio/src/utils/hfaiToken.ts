import qs from 'qs'

export const TokenStorageKeyV1 = 'ailab-web-user-info-v1'
export const TokenStorageKey = 'ailab-web-user-info-v2'

let lastUserToken: string | null = null

function userTokenChangeCallback() {
  window.location.reload()
}

export function getCurrentAgencyUserInfo(): { name: string; token: string } | null {
  const queryInfo = qs.parse(window.location.search.replace(/^\?/, ''))
  if (!queryInfo.current_user && !queryInfo.current_user_token) {
    return null
  }
  if (!queryInfo.current_user || !queryInfo.current_user_token) {
    throw new Error('current_user 和 current_user_token 没有成对出现')
  }
  return {
    name: queryInfo.current_user as string,
    token: queryInfo.current_user_token as string,
  }
}

export function getCurrentAgencyToken(): string | null {
  try {
    const userInfo = getCurrentAgencyUserInfo()
    return userInfo?.token || null
  } catch (e) {
    return null
  }
}

export function getCurrentAgencyUserName(): string | null {
  try {
    const userInfo = getCurrentAgencyUserInfo()
    return userInfo?.name || null
  } catch (e) {
    return null
  }
}

/**
 * 移除旧版的登录
 */
export function removeOldUserToken() {
  localStorage.removeItem(TokenStorageKeyV1)
}

export function getToken() {
  // removeOldUserToken()
  const userInfo = localStorage.getItem(TokenStorageKey)
  if (!userInfo) {
    // 当前信息状态没有了，但是上次却存在过
    if (lastUserToken) {
      userTokenChangeCallback()
    }
    return ''
  }

  try {
    const currentUserInfo = JSON.parse(window.atob(userInfo))
    if (lastUserToken && lastUserToken !== currentUserInfo.token) {
      // 用户换了一个人登录
      userTokenChangeCallback()
    }
    lastUserToken = currentUserInfo.token
    return lastUserToken || ''
  } catch (e) {
    if (lastUserToken) {
      // 其他异常情况
      userTokenChangeCallback()
    }
    return ''
  }
}

export const isCurrentOtherTrainingsUser =
  !!getCurrentAgencyToken() && getCurrentAgencyToken() !== getToken()

export function getUserName() {
  const userInfo = localStorage.getItem(TokenStorageKey)
  if (!userInfo) return null

  try {
    return JSON.parse(window.atob(userInfo)).userName
  } catch (e) {
    return null
  }
}

export function setUserToken(userName: string, token: string) {
  localStorage.setItem(
    TokenStorageKey,
    window.btoa(
      JSON.stringify({
        userName,
        token,
      }),
    ),
  )
}

export function removeUserToken() {
  localStorage.removeItem(TokenStorageKey)
}
