import type { IQuotaMap } from '@hai-platform/shared'
import { TASK_PRIORITY_NAMES_STANDARD } from '@hai-platform/shared'
import type { IPriorityItem } from '@hai-platform/studio-pages/lib/model/TaskCreateSettings'

export const computeQuotaList = (quotaMap: IQuotaMap, quotaGroup: string) => {
  if (!quotaMap[quotaGroup]) return null
  const quota = quotaMap[quotaGroup]
  if (!quota) return []

  return TASK_PRIORITY_NAMES_STANDARD.filter((p) => {
    return p !== 'AUTO'
  }).map((p) => {
    const data = {} as IPriorityItem
    data.priority = p
    data.used = quota[p]?.used ?? '--'
    data.total = quota[p]?.total ?? '--'
    data.limit = quota[p]?.limit ?? '--'
    return data
  })
}
