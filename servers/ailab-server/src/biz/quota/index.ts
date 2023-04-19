import { getUserInfo } from '../../base/auth'
import { getSingleUserQuota } from '../../base/quota'

export const getWorkerUserInfoLegacy = async (token: string) => {
  const user_name = (await getUserInfo(token))?.user_name

  if (!user_name) {
    return {
      all_quota: {},
      already_used_quota: {},
      quota: {},
      quota_limit: {},
    }
  }

  // 老旧的接口不多，改成 true 体验好一点
  const user_node_quota = await getSingleUserQuota(user_name, true)
  const used = { ...user_node_quota.used }
  // 老旧的需要兼容一下
  for (const key of Object.keys(user_node_quota.total?.node || {})) {
    if (!(key in used)) {
      used[key] = 0
    }
  }
  // 这里没有加 NODE- 这些前缀了，实际测下来不加也没事
  const res = {
    quota: user_node_quota.total?.node,
    quota_limit: user_node_quota.total?.node_limit,
    all_quota: user_node_quota.total?.node,
    already_used_quota: used,
  }

  return res
}
