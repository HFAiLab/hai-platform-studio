/* eslint-disable @typescript-eslint/no-unused-vars */
// 节点用量曲线，一般来说这类数据存在 influxDB 中

import type { NodeUsageSeriesResult } from '@hai-platform/client-ailab-server'
import type { OverViewType } from '@hai-platform/studio-schemas'

type OverViewTypeWithExternal = OverViewType | 'external'

// 数据过期时间，该曲线通常 10 分钟刷新一个点，取 1 分钟的过期时间可以接受
export const EXPIRE_TIME = 1 * 60 * 1000

// 在此处独立处理缓存，有新人订阅不会使缓存失效。
export const getUsageSeries = async (
  type: OverViewTypeWithExternal,
  // eslint-disable-next-line require-await
): Promise<NodeUsageSeriesResult> => {
  // 这里补充实际的查询逻辑
  return [] as NodeUsageSeriesResult
}
