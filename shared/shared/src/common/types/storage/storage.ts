/**
 * 目前支持 weka / ceph / 3fs / 3fs-cpu 四种存储，其他情况可自行扩展
 */
export type StorageQuotaType = 'weka' | 'ceph' | '3fs' | '3fs-cpu'

export interface StorageQuotaTreeNode {
  children: StorageQuotaTreeNode[]
  path: string
  time: string
  used_bytes: number
  unknown_bytes?: number
  sum_bytes?: number
  limit_bytes?: number
  fetched_data: number
  user_name?: string
  tag?: string
  replicas?: number
}

export interface StorageUsageItem {
  // 记录写入的时间，带时区的 ISO format
  time: string

  // 精确的用量
  used_bytes: number

  // 是否获取到了精确数据，为 1 或 0, 目前仅 weka 部分路径可能为 0
  fetched_data: number

  // 数据库中预留的字段，目前暂未使用
  user_name: string | null

  //  数据库中预留的字段，目前暂未使用
  tag: string | null

  // 用量 quota, 仅 weka
  limit_bytes?: number

  // 根据子目录信息求和的估算用量，仅 weka
  sum_bytes?: number

  // 估算用量与精确用量的差距，仅 weka
  unknown_bytes?: number

  // 备份模式，没有该字段时默认为单备份
  replicas?: number
}

export interface StorageUsageForPath {
  path: string
  /**
   * 后端会加一个 note 标志这个路径是干啥的
   */
  note?: string
  usage: StorageUsageItem | null
}

export interface ExternalStorageUsage {
  workspace: StorageUsageForPath
  dev_space: StorageUsageForPath
  group_dataset_dir: StorageUsageForPath
  group_shared_total: StorageUsageForPath
  group_workspace_total: StorageUsageForPath
}
