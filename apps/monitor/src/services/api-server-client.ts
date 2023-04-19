import { ApiServerApiName, createApiServerClient } from '@hai-platform/client-api-server'
import type {
  ApiServerClient,
  GetNodesPerformanceResult,
  GetNodesSummarySeriesResult,
  GetStorageQuotaHistoryResult,
  GetStorageQuotaResult,
  GetTasksDistributionResult,
  NodesPerformanceItem,
  NodesSummarySeriesItem,
} from '@hai-platform/client-api-server'
import { getCurrentClusterServerURL } from '@/config'
import { createApiServerRequest } from './api-server-request'

export type { GetTasksDistributionResult as TasksDistribution }

export { ApiServerApiName }
export type {
  GetStorageQuotaResult as StorageQuota,
  GetStorageQuotaHistoryResult as StorageQuotaHistory,
  GetNodesPerformanceResult as NodesPerformance,
  GetNodesSummarySeriesResult as NodesSummarySeries,
  NodesPerformanceItem,
  NodesSummarySeriesItem,
}

export const apiServerClient: ApiServerClient = createApiServerClient({
  httpRequest: createApiServerRequest({
    baseURL: getCurrentClusterServerURL(),
  }),
})
