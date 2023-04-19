import { AdminGroup, UserRole } from '@hai-platform/shared'
import type { Context } from 'koa'
import {
  convertUserToSingleUserInfoWithoutToken,
  genGetUserPromise,
  getUserInfo,
} from '../base/auth'
import { findUserByName } from '../base/users'
import { GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES } from '../config'
import { GlobalPromiseSingletonExecuter } from './promise'

export async function groupChecker(
  name: string,
  token: string,
  groupAllowed: readonly string[],
): Promise<boolean> {
  const u = await getUserInfo(token)
  if (!u || name !== u.user_name) {
    return false
  }
  let passed = false
  for (const g of u?.group_list ?? []) {
    groupAllowed.includes(g) && (passed = true)
  }
  return passed
}

export const setNoPermission = (ctx: Context) => {
  ctx.response.status = 403
  ctx.response.body = {
    success: 0,
    msg: 'No Permission.',
  }
}

export const checkYinghuoStatsPermission = async (name: string, token: string, role: UserRole) => {
  // 权限验证
  const hasPermissionAll = await groupChecker(name, token, [
    AdminGroup.ROOT,
    AdminGroup.YINGHUO_STATUS_VIEWER,
  ])
  const hasPermissionExternal = await groupChecker(name, token, [
    AdminGroup.ROOT,
    AdminGroup.YINGHUO_STATUS_VIEWER_EXT_ONLY,
  ])

  const hasPermission = hasPermissionAll || (role === UserRole.EXTERNAL && hasPermissionExternal)

  return hasPermission
}

export const getYinghuoStatsTargetUser = async (targetUser: string, token: string) => {
  // 优先从全局的用户信息里面拿，减少 get_user_info 的请求
  const user_info = await findUserByName(targetUser)
  if (user_info) return convertUserToSingleUserInfoWithoutToken(user_info)
  // 如果没拿到，去后端请求
  const user = await GlobalPromiseSingletonExecuter.execute(
    genGetUserPromise,
    [token],
    `${GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.get_user_info_prefix}_${token}`,
  )
  return user
}
