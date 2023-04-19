export enum SyncFileType {
  workspace = 'workspace',
  env = 'env',
  dataset = 'dataset',
}

export enum SyncDirection {
  push = 'push',
  pull = 'pull',
}

export interface SyncStatus {
  name: string
  user_name: string
  user_role: string
  file_type: SyncFileType
  direction: SyncDirection
  status: 'string'
  local_path: string
  cluster_path: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type SyncStatusList = SyncStatus[]

export interface WorkspaceFile {
  last_modified: string
  md5: null
  path: string
  size: number
  /**
   * 这个文件是否是在 hfignore 里面
   */
  ignored?: boolean | null
}

export interface WorkspaceFileLists {
  items: WorkspaceFile[]
  page: number
  size: number
  total: number
}
