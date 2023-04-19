import type { AilabServerClient } from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { IQuotaMap } from '@hai-platform/shared'
import {
  TaskPriority,
  TaskPriorityName,
  convertUserQuotaInfoToQuotaMap,
  isBackgroundTask,
  isHalfTask,
  priorityToNumber,
} from '@hai-platform/shared'

export class UserHelper {
  static async getQuotaFromRemote(options: {
    token: string
    ailabServerClient: AilabServerClient
  }) {
    const res = await options.ailabServerClient.request(
      AilabServerApiName.TRAININGS_USER_NODE_QUOTA_INFO,
      {
        token: options.token,
      },
    )
    const userQuotaMap = convertUserQuotaInfoToQuotaMap(res)
    return userQuotaMap
  }

  static getAvailablePriority(options: { group: string; quotaMap: IQuotaMap | null }): Set<number> {
    if (isBackgroundTask(options.group)) {
      return new Set([TaskPriority.AUTO])
    }

    if (!window._hf_user_if_in) {
      return new Set([TaskPriority.AUTO])
    }

    const group = options.group.replace(/#.*?$/, '')
    const quotaMap = options.quotaMap?.[group] || {}
    if (!quotaMap) return new Set<number>()
    const availablePriorities = new Set<number>()

    for (const [key, value] of Object.entries(quotaMap)) {
      const hasQuota =
        'limit' in value ? (value.limit || 1) > 0 && value.total > 0 : value.total > 0
      if (hasQuota) {
        availablePriorities.add(priorityToNumber(key))
      }
    }
    return availablePriorities
  }

  static getQuota(options: {
    group: string | null
    sourceQuotaMap: IQuotaMap | null
    priorityName: TaskPriorityName
  }): number {
    if (isBackgroundTask(options.group) || isHalfTask(options.group)) {
      return 1
    }

    if (!options.group) return -1
    const group = options.group.replace(/#.*?$/, '')

    if (options.priorityName === TaskPriorityName.AUTO) {
      return 10000 // hint: 万卡算力，最多允许提 10000 个，虽然可能跑不起来罢了
    }

    if (window._hf_user_if_in) {
      // 内部用户
      const quotaMap = options.sourceQuotaMap?.[group]
      if (!quotaMap) return -1
      const quotaInfo = quotaMap[options.priorityName]
      if (!quotaInfo) return -1
      return Math.min(quotaInfo.limit || 10000, quotaInfo.total)
    }
    // 外部用户不校验了
    return -1
  }
}
