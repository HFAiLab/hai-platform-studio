/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataUsageSummary } from '@hai-platform/client-ailab-server'

export enum ReportFileType {
  // 文件名称仅供示例
  EXTERNAL_TOTAL_GPU_USER = 'external_total_by_user_name.json',
  EXTERNAL_TOTAL_GPU_GROUP = 'external_total_by_shared_group.json',
}

export class ExternalTotalGpuHourConsumer {
  // eslint-disable-next-line require-await
  readFromDisk = async (
    date: 'last',
    type: ReportFileType,
  ): Promise<{ dateRange?: string; data: DataUsageSummary[] }> => {
    // 这里补充实际的查询逻辑
    return {
      data: [],
    }
  }
}
