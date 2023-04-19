export interface WorkerUserQuotaInfo {
  all_quota: {
    [groupPriority: string]: number
  }
  already_used_quota: {
    [groupPriority: string]: number
  }
  quota: {
    [groupPriority: string]: number
  }
  quota_limit: {
    [groupPriority: string]: number
  }
  user_name: string
}

export interface SingleUserNodeTotalQuota {
  node: {
    [node_priority: string]: number
  }
  node_limit: {
    [node_priority: string]: number
  }
  node_limit_extra: {
    [node_priority: string]: number
  }
}

export interface SingleUserNodeUsedQuota {
  [node_priority: string]: number
}

export interface TotalUserNodeUsedQuota {
  [user_name: string]: SingleUserNodeUsedQuota
}

/**
 * 包含 total 和 used
 */
export interface UserNodeQuotaInfo {
  total: SingleUserNodeTotalQuota

  used?: SingleUserNodeUsedQuota
}
