/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { SingleUserNodeTotalQuota, UserNodeQuotaInfo, WorkerUserQuotaInfo } from '../../types'
import type { TaskPriorityName } from '../priority'

export type IQuota = {
  [key in TaskPriorityName]?: { total: number; used: number; limit?: number }
}

export type IQuotaMap = {
  [groupName: string]: IQuota
}

export function convertResponseToQuotaMap(resp: WorkerUserQuotaInfo): IQuotaMap {
  const map = {} as IQuotaMap
  const quota = {} as { [groupName: string]: number }
  const limit = {} as { [groupName: string]: number }
  const used = resp.already_used_quota

  // resp.quota 's key has an initial 'node-' string, need to remove
  for (const key in resp.quota) {
    quota[key.replace('node-', '')] = resp.quota[key] as number
  }

  // resp.limit 's key has an initial 'node_limit-' string, need to remove
  for (const key in resp.quota_limit) {
    limit[key.replace('node_limit-', '')] = resp.quota_limit[key] as number
  }

  const keys = Object.keys(quota)
  for (const key of keys) {
    const [groupName, priorityName] = key.split('-')
    map[groupName!] = map[groupName!] ?? {}
    map[groupName!]![priorityName as TaskPriorityName] = {
      total: quota[key]!,
      used: used[key]!,
    }
  }
  const limitKeys = Object.keys(limit)
  for (const key of limitKeys) {
    const [groupName, priorityName] = key.split('-')
    if (!map[groupName!] || !map[groupName!]![priorityName as TaskPriorityName]) {
      continue
    } else {
      map[groupName!]![priorityName! as TaskPriorityName]!.limit = limit[key]!
    }
  }

  return map
}

export const convertUserQuotaInfoToQuotaMap = (resp: UserNodeQuotaInfo): IQuotaMap => {
  const map = {} as IQuotaMap
  for (const key of Object.keys(resp.total.node)) {
    const [groupName, priorityName] = key.split('-') as [string, string]
    if (!map[groupName]) map[groupName] = {}
    map[groupName]![priorityName as TaskPriorityName] = {
      total: resp.total.node[key]!,
      used: resp.used?.[key] || 0,
      limit: resp.total.node_limit[key],
    }
  }

  return map
}

/**
 * 是否曾经因为 weka 超过限制被限制了 Quota
 */
export const ifHasWekaLimit = (totalQuota: SingleUserNodeTotalQuota): boolean => {
  if (!totalQuota.node_limit_extra) return false

  for (const key of Object.keys(totalQuota.node_limit_extra)) {
    if (key.includes(`[weka]`) && totalQuota.node_limit_extra[key] === 0) return true
  }

  return false
}
