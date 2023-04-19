import type { SingleUserInfo } from '@hai-platform/shared'

/**
 * bff 层特有的不包括 token 的用户信息
 *
 * 这里的原因是他是使用 all_users 的缓存信息，是没有 token 的！
 */
export type SingleUserInfoWithoutToken = Omit<SingleUserInfo, 'token' | 'access_scope'>

export type StudioUser = SingleUserInfoWithoutToken & {
  admin?: boolean
}
