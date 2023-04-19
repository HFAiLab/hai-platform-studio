import type { GetReportDataBody } from '@hai-platform/client-ailab-server'

interface ReportInfo {
  timestamp: number
  status: 'pending' | 'success'
}

export class Report {
  statusMap: Map<string, ReportInfo> = new Map()

  debounce = 10 * 1000

  shouldReqAndChangeStatus = (key: string) => {
    const info = this.statusMap.get(key)
    if (!info) {
      this.statusMap.set(key, {
        timestamp: Date.now(),
        status: 'pending',
      })
      return true
    }

    if (info.status === 'pending') return false

    if (info.status === 'success') {
      if (info.timestamp + this.debounce > Date.now()) return false
    }

    this.statusMap.set(key, {
      timestamp: Date.now(),
      status: 'pending',
    })
    return true
  }

  resolveReq = (key: string) => {
    this.statusMap.set(key, {
      timestamp: Date.now(),
      status: 'success',
    })
  }

  rejectReq = (key: string) => {
    this.statusMap.delete(key)
  }

  static genKey(params: GetReportDataBody) {
    return `${params.taskType}_${params.DatePeriod}_${
      params.dateType === 'certain' ? params.dateStr : params.dateType
    }`
  }

  clear() {
    this.statusMap = new Map()
  }
}

export const GlobalReportInstance = new Report()
