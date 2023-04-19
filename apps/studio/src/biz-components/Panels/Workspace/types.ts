export interface SyncStatusObjectMap {
  [key: string]: SyncStatusObject
}

export enum SyncStatus {
  running = 'running',
  finished = 'finished',
  failed = 'failed',
  init = 'init',
}

export interface SyncStatusObject {
  name: string
  local_path: string
  cluster_path: string
  push_status?: SyncStatus
  push_updated_at?: string
  pull_status?: SyncStatus
  pull_updated_at?: string
}
