export enum AdminGroup {
  /**
   * Root 用户，理论上有所有权限
   */
  ROOT = 'root',
  // 注意，这两个早期分组没有 a_开头

  /**
   * 内部用户 quota limit 变更管理员权限
   */
  INTERNAL_QUOTA_LIMIT_EDITOR = 'internal_quota_limit_editor',

  /**
   * 外部用户 quota 管理管理员权限
   */
  EXTERNAL_QUOTA_EDITOR = 'external_quota_editor',

  /**
   * 集群用量报表，包含内外部
   */
  YINGHUO_STATUS_VIEWER = 'a_yinghuo_status_viewer',

  /**
   * 集群用量报表，仅外部
   */
  YINGHUO_STATUS_VIEWER_EXT_ONLY = 'a_yinghuo_status_viewer_ext_only',

  /**
   * 附加权限，仅展示外部用户的 user_name 和真名对照等信息
   */
  ONLY_EXTERNAL_NICKNAME = 'a_only_external_nickname', // 此分组会被限制访问一些内部用户的信息

  /**
   * 外部用户账户管理，包含开账户 vpn 等操作，该分组也包含了外部用户活跃和存储的面板权限
   */
  EXTERNAL_ACCOUNT_ADMIN = 'a_external_account_admin',

  /**
   * 数据集管理权限
   */
  DATASET_ADMIN = 'a_dataset_admin',

  /**
   * 讨论区管理权限
   */
  XTOPIC_ADMIN = 'a_xtopic_admin',

  /**
   * 集群管理员，包含集群节点等的管理权限
   */
  CLUSTER_MANAGER = 'cluster_manager',

  /**
   * 运维权限
   */
  OPS = 'ops',

  /**
   * 开发者管理员，包含禁用用户等操作
   */
  DEVELOPER_ADMIN = 'developer_admin',

  /**
   * 修改 Schedule Zone 的权限，包含任务和用户
   */
  SWITCH_TASK = 'switch_task',

  /**
   * 打断任务的权限
   */
  SUSPEND_TASK = 'suspend_task',

  /**
   * 开发容器的管理能力
   */
  HUB_ADMIN = 'hub_admin',
}

/**
 * 通常用于 studio 右上角管理按钮的显示控制
 * 注意，不包含 ONLY_EXTERNAL_NICKNAME, 该组无法单独使用
 * 不包含数据集权限 DATASET_ADMIN，数据集的管理都在数据集页面上
 */
export const CanAdminGroups = [
  AdminGroup.ROOT,
  AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR,
  AdminGroup.EXTERNAL_QUOTA_EDITOR,
  AdminGroup.YINGHUO_STATUS_VIEWER,
  AdminGroup.YINGHUO_STATUS_VIEWER_EXT_ONLY,
  AdminGroup.EXTERNAL_ACCOUNT_ADMIN,
  AdminGroup.XTOPIC_ADMIN,
] as const

/**
 * 集群监控
 */
export const MonitorCanAdminGroups = [
  AdminGroup.ROOT,
  AdminGroup.OPS,
  AdminGroup.CLUSTER_MANAGER,
  AdminGroup.DEVELOPER_ADMIN,
  AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR,
  AdminGroup.EXTERNAL_QUOTA_EDITOR,
  AdminGroup.SWITCH_TASK,
  AdminGroup.SUSPEND_TASK,
]
