// 外部用户精简后的可用闲时节点数之类的信息，可以使用 cluster df 直接算

import type { ClusterOverviewDetail } from '@hai-platform/client-api-server'
import { CLUSTER_DF_INTERVAL, GlobalTaskPerfQuerier } from '../taskCurrentPerf'

// 目前 clusterDF 的获取是 15s 间隔
const ExternalClusterOverviewCache = {
  time: 0,
  value: null as ClusterOverviewDetail | null,
}

export async function getExternalClusterOverview() {
  const clusterDF = await GlobalTaskPerfQuerier.queryClusterDf()

  if (
    ExternalClusterOverviewCache.value &&
    ExternalClusterOverviewCache.time > Date.now() - CLUSTER_DF_INTERVAL
  ) {
    return ExternalClusterOverviewCache.value
  }

  let working = 0
  let free = 0

  const nodes = clusterDF.filter(
    (node) =>
      node.current_category === 'training' && node.status === 'Ready' && node.group === 'jd_a100',
  )
  free = nodes.filter((node) => !node.working).length
  working = nodes.filter((node) => node.working && node.working_user_role === 'external').length
  const total = working + free
  const usage_rate = total === 0 ? 0 : working / total

  const ret = {
    usage_rate,
    total,
    free,
    working,
    other: 0,
  } as ClusterOverviewDetail
  ExternalClusterOverviewCache.value = ret
  ExternalClusterOverviewCache.time = Date.now()
  return ret
}
