import { AdminGroup } from '@hai-platform/shared'
import { getUserInfo } from '../../base/auth'

/**
 * 是否是看板的管理员
 */
export const isXTopicAdmin = async (token: string): Promise<boolean> => {
  const userInfo = await getUserInfo(token)
  if (
    userInfo &&
    (userInfo.group_list.includes(AdminGroup.XTOPIC_ADMIN) ||
      userInfo.group_list.includes(AdminGroup.ROOT))
  ) {
    return true
  }

  return false
}
