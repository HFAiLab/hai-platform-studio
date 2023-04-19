import type { HttpRequestConfig } from '@hai-platform/request-client'
import type {
  ApplyQuotaForWekaUsageApiConfig,
  ArchiveExternalUserConfig,
  ChainPerfSeriesConfig,
  ChangeExternalUserNicknameConfig,
  ChangeNodeStateConfig,
  ClusterDFApiConfig,
  CreateAccessTokenConfig,
  CreateTaskV2Config,
  CreateUserConfig,
  DeleteAccessTokenConfig,
  DeleteNodePortSvcConfig,
  GetClusterOverviewForClientApiConfig,
  GetExternalUserActivenessApiConfig,
  GetExternalUserPriorityQuotaApiConfig,
  GetExternalUserStorageStatApiConfig,
  GetGpuDailyStatisticsApiConfig,
  GetInternalUserPriorityQuotaApiConfig,
  GetNodesOverviewApiConfig,
  GetNodesPerformanceApiConfig,
  GetNodesSummarySeriesApiConfig,
  GetRunningTasksApiConfig,
  GetStorageQuotaApiConfig,
  GetStorageQuotaHistoryApiConfig,
  GetSyncStatusApiConfig,
  GetTaskContainerMonitorStatsApiConfig,
  GetTaskLogApiConfig,
  GetTaskSysLogApiConfig,
  GetTaskTagsApiConfig,
  GetTasksDistributionApiConfig,
  GetTasksHistoryApiConfig,
  GetTimeRangeScheduleInfoApiConfig,
  GetTrainImagesApiConfig,
  GetUserApiConfig,
  GetUserPersonalStorageConfig,
  GetUserQuotaApiConfig,
  GetUserStorage3fsCPUUsageApiConfig,
  GetUserStorage3fsUsageApiConfig,
  GetUserStorageUsageApiConfig,
  GetUserTaskApiConfig,
  GetUserTasksApiConfig,
  GetUsersApiConfig,
  ListClusterFilesConfig,
  NodePortSvcConfig,
  ResumeTaskConfig,
  SearchInGlobalApiConfig,
  ServiceTaskAllTasksApiConfig,
  ServiceTaskCheckPointConfig,
  ServiceTaskControlConfig,
  ServiceTaskCreateV2Config,
  ServiceTaskDeleteConfig,
  ServiceTaskMoveNodeConfig,
  ServiceTaskRestartConfig,
  ServiceTaskTasksApiConfig,
  SetExternalUserActiveStateConfig,
  SetExternalUserPriorityQuotaConfig,
  SetTrainingQuotaConfig,
  SetUserActiveStateConfig,
  StopTaskConfig,
  SuspendTaskConfig,
  SwitchScheduleZoneConfig,
  TagTaskConfig,
  TrainingQuotaLimitUpdateConfig,
  UnTagTaskConfig,
  UpdatePriorityApiApiConfig,
  UpdateUserGroupConfig,
  ValidateTaskConfig,
} from './api'
import { ValidateTaskRequestConfigHandler } from './api'
import type { DeleteTagsConfig } from './api/operating/delete-tags'
import type { ListAccessTokenConfig } from './api/operating/list-access-token'
import type { GetAllUserNodeQuotaApiConfig } from './api/query/get-all-user-node-quota'
import { MethodToGetHandler } from './defaultHandlers'


/**
 * Api Server API 名称
 */
export enum ApiServerApiName {
  // ========================================= Operating ========================================
  /**
   * 创建用户
   */
  CREATE_USER = 'CREATE_USER',

  /**
   * 创建实验，第二版接口
   */
  CREATE_TASK_V2 = 'CREATE_TASK_V2',

  /**
   * 创建 kai 实验，第二版接口
   */
  SERVICE_TASK_CREATE_V2 = 'SERVICE_TASK_CREATE_V2',

  /**
   * 验证实验
   */
  VALIDATE_TASK = 'VALIDATE_TASK',

  /**
   * 停止实验
   */
  STOP_TASK = 'STOP_TASK',

  /**
   * 恢复跑实验
   */
  RESUME_TASK = 'RESUME_TASK',

  /**
   * 打断实验
   */
  SUSPEND_TASK = 'SUSPEND_TASK',

  /**
   * 给实验设置标签，包含了 star_task 的功能
   */
  TAG_TASK = 'TAG_TASK',

  /**
   * 给实验取消设置标签，包含了 unstar_task 的功能
   */
  UNTAG_TASK = 'UNTAG_TASK',

  /**
   * 删除用户所有任务中的指定标签
   */
  DELETE_TAGS = 'DELETE_TAGS',

  /**
   * 更新任务优先级（目前用于拖拽需求）
   */
  UPDATE_PRIORITY_API = 'UPDATE_PRIORITY_API',

  /**
   * 移动并且空出来一个节点，给自己起开发容器用
   */
  SERVICE_TASK_MOVE_NODE = 'SERVICE_TASK_MOVE_NODE',

  /**
   * 和 SET_USER_GPU_QUOTA 在后端实际上是一个实现，只不过接口的定义不同
   */
  SET_TRAINING_QUOTA = 'SET_TRAINING_QUOTA',

  /**
   *删除一个开发容器任务
   */
  SERVICE_TASK_DELETE = 'SERVICE_TASK_DELETE',

  /**
   * 给一个开发容器 任务增加 checkpoint
   */
  SERVICE_TASK_CHECKPOINT = 'SERVICE_TASK_CHECKPOINT',

  /**
   * 管理开发容器中的一个服务，比如 jupyter 服务
   */
  SERVICE_TASK_CONTROL = 'SERVICE_TASK_CONTROL',

  /**
   * 设置外部用户对应优先级的配额
   */
  SET_EXTERNAL_USER_PRIORITY_QUOTA = 'SET_EXTERNAL_USER_PRIORITY_QUOTA',

  /**
   * 设置外部用户的激活状态
   */
  SET_EXTERNAL_USER_ACTIVE_STATE = 'SET_EXTERNAL_USER_ACTIVE_STATE',

  /**
   * 设置内部用户 Quota 限额
   */
  TRAINING_QUOTA_LIMIT_UPDATE = 'TRAINING_QUOTA_LIMIT_UPDATE',

  /**
   * 直接重启正在运行的开发容器
   */
  SERVICE_TASK_RESTART = 'SERVICE_TASK_RESTART',

  /**
   * 直接重启正在运行的开发容器
   */
  SERVICE_TASK_STOP = 'SERVICE_TASK_STOP',

  /**
   * 用户登录创建 access token
   */
  CREATE_ACCESS_TOKEN = 'CREATE_ACCESS_TOKEN',

  /**
   * 用户登录删除 access token
   */
  DELETE_ACCESS_TOKEN = 'DELETE_ACCESS_TOKEN',

  /**
   * 改变 schedule zone, 支持按 username / task id / chain id 操作
   */
  SWITCH_SCHEDULE_ZONE = 'SWITCH_SCHEDULE_ZONE',

  /**
   * 禁用用户/恢复用户使用
   */
  SET_USER_ACTIVE_STATE = 'SET_USER_ACTIVE_STATE',

  /**
   * 禁用/重新启用节点
   */
  CHANGE_NODE_STATE = 'CHANGE_NODE_STATED',

  /**
   * 更新用户组
   */
  UPDATE_USER_GROUP = 'UPDATE_USER_GROUP',

  // ========================================= Query ==========================================

  /**
   * 获取节点概览信息
   */
  GET_NODES_OVERVIEW = 'GET_NODES_OVERVIEW',

  /**
   * 获取全部运行中的任务信息
   */
  GET_RUNNING_TASKS = 'GET_RUNNING_TASKS',

  /**
   * 获取任务分布情况
   */
  GET_TASKS_DISTRIBUTION = 'GET_TASKS_DISTRIBUTION',

  /**
   * 查询一段时间内的所有历史任务
   */
  GET_TASKS_HISTORY = 'GET_TASKS_HISTORY',

  /**
   * 查询用户所有的打标
   */
  GET_TASK_TAGS = 'GET_TASK_TAGS',

  /**
   * 获取当前用户的信息
   */
  GET_USER = 'GET_USER',

  /**
   * 获取当前用户的配额
   */
  GET_USER_QUOTA = 'GET_USER_QUOTA',

  /**
   * 查询当前用户的单个任务
   */
  GET_USER_TASK = 'GET_USER_TASK',

  /**
   * 查询当前用户的任务
   */
  GET_USER_TASKS = 'GET_USER_TASKS',

  /**
   * 获取全部用户信息
   */
  GET_USERS = 'GET_USERS',

  /**
   * 获取集群节点概况信息（给用户看的简略版）
   */
  GET_CLUSTER_OVERVIEW_FOR_CLIENT = 'GET_CLUSTER_OVERVIEW_FOR_CLIENT',

  /**
   * 获取一段时间内任务提交和完成的数量
   */
  GET_TIME_RANGE_SCHEDULE_INFO = 'GET_TIME_RANGE_SCHEDULE_INFO',

  /**
   * 获取实验的输出日志
   */
  GET_TASK_LOG = 'GET_TASK_LOG',

  /**
   * 获取实验的系统日志，一般用于定位错误
   */
  GET_TASK_SYS_LOG = 'GET_TASK_SYS_LOG',

  /**
   * 获取集群所有节点的信息
   */
  CLUSTER_DF = 'CLUSTER_DF',

  /**
   * 搜索全局日志
   */
  SEARCH_IN_GLOBAL = 'SEARCH_IN_GLOBAL',

  /**
   * 获取全部开发容器服务
   */
  SERVICE_TASK_ALL_TASKS = 'SERVICE_TASK_ALL_TASKS',

  /**
   * 获取当前用户的开发容器
   */
  SERVICE_TASK_TASKS = 'SERVICE_TASK_TASKS',

  /**
   * 获取内部用户 Quota
   */
  GET_EXTERNAL_USER_PRIORITY_QUOTA = 'GET_EXTERNAL_USER_PRIORITY_QUOTA',

  /**
   * 获取外部用户 Quota
   */
  GET_INTERNAL_USER_PRIORITY_QUOTA = 'GET_INTERNAL_USER_PRIORITY_QUOTA',

  /**
   * 列出当前所有拥有的 access token
   */
  LIST_ACCESS_TOKEN = 'LIST_ACCESS_TOKEN',

  /**
   * 获取实验的容器 CPU 和内存信息
   */
  GET_TASK_CONTAINER_MONITOR_STATS = 'GET_TASK_CONTAINER_MONITOR_STATS',

  /**
   * 获取所有用户的 quota，包含 node 和 node_limit
   */
  GET_ALL_USER_NODE_QUOTA = 'GET_ALL_USER_NODE_QUOTA',
  // ========================================= Ugc ============================================
  /**
   * 列举文件，通常用于 workspace
   */
  LIST_CLUSTER_FILES = 'LIST_CLUSTER_FILES',

  /**
   * 创建暴露端口
   */
  NODE_PORT_SVC = 'NODE_PORT_SVC',

  /**
   * 删除暴露的端口
   */
  DELETE_NODE_PORT_SVC = 'DELETE_NODE_PORT_SVC',

  /**
   * 获取 workspace 的同步状态
   */
  GET_SYNC_STATUS = 'GET_SYNC_STATUS',

  /**
   * 获取用户训练可用的镜像信息，包括内建镜像
   */
  GET_TRAIN_IMAGES = 'GET_TRAIN_IMAGES',

  /**
   * 归档外部用户
   */
  ARCHIVE_EXTERNAL_USER = 'ARCHIVE_EXTERNAL_USER',

  /**
   * 更新外部用户的中文名显示
   */
  CHANGE_EXTERNAL_USER_NICKNAME = 'CHANGE_EXTERNAL_USER_NICKNAME',

  /**
   * 用户申请 quota
   */
  APPLY_QUOTA_FOR_WEKA_USAGE = 'APPLY_QUOTA_FOR_WEKA_USAGE',

  // ========================================= Monitor ========================================
  /**
   * 获取节点性能数据
   */
  GET_GPU_DAILY_STATISTICS = 'GET_GPU_DAILY_STATISTICS',

  /**
   * 获取节点性能数据
   */
  GET_NODES_PERFORMANCE = 'GET_NODES_PERFORMANCE',

  /**
   * 获取使用情况数据局
   */
  GET_NODES_SUMMARY_SERIES = 'GET_NODES_SUMMARY_SERIES',

  /**
   * 获取存储配额信息
   */
  GET_STORAGE_QUOTA = 'GET_STORAGE_QUOTA',

  /**
   * 获取存储配额信息历史记录
   */
  GET_STORAGE_QUOTA_HISTORY = 'GET_STORAGE_QUOTA_HISTORY',

  /**
   * 获取用户个人可用的挂在路径和容量
   */
  USER_STORAGE_LIST = 'USER_STORAGE_LIST',

  /**
   * 获取 Chain 的性能数据
   */
  CHAIN_PERF_SERIES = 'CHAIN_PERF_SERIES',

  /**
   * 获取个人存储的使用情况 (weka)
   */
  USER_STORAGE_WEKA_USAGE = 'USER_STORAGE_WEKA_USAGE',

  /**
   * 获取个人存储的使用情况 (3fs)
   */
  USER_STORAGE_3FS_USAGE = 'USER_STORAGE_3FS_USAGE',

  /**
   * 获取个人存储的使用情况 (3fs_cpu_usage)
   */
  USER_STORAGE_3FS_CPU_USAGE = 'USER_STORAGE_3FS_CPU_USAGE',

  /**
   * 获取用户活跃情况
   */
  GET_EXTERNAL_USER_ACTIVENESS = 'GET_EXTERNAL_USER_ACTIVENESS',

  /**
   * 获取外部用户存储用量
   */
  GET_EXTERNAL_USER_STORAGE_STAT = 'GET_EXTERNAL_USER_STORAGE_STAT',

}

/**
 * Api Server API 类型配置
 */
export interface ApiServerApiConfigMap {
  // ========================================= Operating ========================================
  [ApiServerApiName.CREATE_USER]: CreateUserConfig
  [ApiServerApiName.CREATE_TASK_V2]: CreateTaskV2Config
  [ApiServerApiName.SERVICE_TASK_CREATE_V2]: ServiceTaskCreateV2Config
  [ApiServerApiName.VALIDATE_TASK]: ValidateTaskConfig
  [ApiServerApiName.STOP_TASK]: StopTaskConfig
  [ApiServerApiName.RESUME_TASK]: ResumeTaskConfig
  [ApiServerApiName.SUSPEND_TASK]: SuspendTaskConfig
  [ApiServerApiName.TAG_TASK]: TagTaskConfig
  [ApiServerApiName.UNTAG_TASK]: UnTagTaskConfig
  [ApiServerApiName.DELETE_TAGS]: DeleteTagsConfig
  [ApiServerApiName.UPDATE_PRIORITY_API]: UpdatePriorityApiApiConfig
  [ApiServerApiName.SERVICE_TASK_MOVE_NODE]: ServiceTaskMoveNodeConfig
  [ApiServerApiName.SET_TRAINING_QUOTA]: SetTrainingQuotaConfig
  [ApiServerApiName.UPDATE_USER_GROUP]: UpdateUserGroupConfig
  [ApiServerApiName.SERVICE_TASK_DELETE]: ServiceTaskDeleteConfig
  [ApiServerApiName.SERVICE_TASK_CHECKPOINT]: ServiceTaskCheckPointConfig
  [ApiServerApiName.SET_EXTERNAL_USER_PRIORITY_QUOTA]: SetExternalUserPriorityQuotaConfig
  [ApiServerApiName.TRAINING_QUOTA_LIMIT_UPDATE]: TrainingQuotaLimitUpdateConfig
  [ApiServerApiName.SERVICE_TASK_RESTART]: ServiceTaskRestartConfig
  [ApiServerApiName.SERVICE_TASK_STOP]: StopTaskConfig
  [ApiServerApiName.CREATE_ACCESS_TOKEN]: CreateAccessTokenConfig
  [ApiServerApiName.DELETE_ACCESS_TOKEN]: DeleteAccessTokenConfig
  [ApiServerApiName.SERVICE_TASK_CONTROL]: ServiceTaskControlConfig
  [ApiServerApiName.SET_EXTERNAL_USER_ACTIVE_STATE]: SetExternalUserActiveStateConfig
  [ApiServerApiName.SWITCH_SCHEDULE_ZONE]: SwitchScheduleZoneConfig
  [ApiServerApiName.SET_USER_ACTIVE_STATE]: SetUserActiveStateConfig
  [ApiServerApiName.CHANGE_NODE_STATE]: ChangeNodeStateConfig
  // ========================================= Query ==========================================
  [ApiServerApiName.GET_NODES_OVERVIEW]: GetNodesOverviewApiConfig
  [ApiServerApiName.GET_RUNNING_TASKS]: GetRunningTasksApiConfig
  [ApiServerApiName.GET_TASKS_DISTRIBUTION]: GetTasksDistributionApiConfig
  [ApiServerApiName.GET_TASKS_HISTORY]: GetTasksHistoryApiConfig
  [ApiServerApiName.GET_TASK_TAGS]: GetTaskTagsApiConfig
  [ApiServerApiName.GET_USER]: GetUserApiConfig
  [ApiServerApiName.GET_USER_QUOTA]: GetUserQuotaApiConfig
  [ApiServerApiName.GET_USER_TASK]: GetUserTaskApiConfig
  [ApiServerApiName.GET_USER_TASKS]: GetUserTasksApiConfig
  [ApiServerApiName.GET_USERS]: GetUsersApiConfig
  [ApiServerApiName.GET_CLUSTER_OVERVIEW_FOR_CLIENT]: GetClusterOverviewForClientApiConfig
  [ApiServerApiName.GET_TIME_RANGE_SCHEDULE_INFO]: GetTimeRangeScheduleInfoApiConfig
  [ApiServerApiName.GET_TASK_LOG]: GetTaskLogApiConfig
  [ApiServerApiName.GET_TASK_SYS_LOG]: GetTaskSysLogApiConfig
  [ApiServerApiName.CLUSTER_DF]: ClusterDFApiConfig
  [ApiServerApiName.SEARCH_IN_GLOBAL]: SearchInGlobalApiConfig
  [ApiServerApiName.SERVICE_TASK_ALL_TASKS]: ServiceTaskAllTasksApiConfig
  [ApiServerApiName.SERVICE_TASK_TASKS]: ServiceTaskTasksApiConfig
  [ApiServerApiName.GET_INTERNAL_USER_PRIORITY_QUOTA]: GetInternalUserPriorityQuotaApiConfig
  [ApiServerApiName.GET_EXTERNAL_USER_PRIORITY_QUOTA]: GetExternalUserPriorityQuotaApiConfig
  [ApiServerApiName.LIST_ACCESS_TOKEN]: ListAccessTokenConfig
  [ApiServerApiName.GET_TASK_CONTAINER_MONITOR_STATS]: GetTaskContainerMonitorStatsApiConfig
  [ApiServerApiName.GET_ALL_USER_NODE_QUOTA]: GetAllUserNodeQuotaApiConfig
  // ========================================= Ugc ============================================
  [ApiServerApiName.LIST_CLUSTER_FILES]: ListClusterFilesConfig
  [ApiServerApiName.NODE_PORT_SVC]: NodePortSvcConfig
  [ApiServerApiName.DELETE_NODE_PORT_SVC]: DeleteNodePortSvcConfig
  [ApiServerApiName.GET_SYNC_STATUS]: GetSyncStatusApiConfig
  [ApiServerApiName.GET_TRAIN_IMAGES]: GetTrainImagesApiConfig
  [ApiServerApiName.ARCHIVE_EXTERNAL_USER]: ArchiveExternalUserConfig
  [ApiServerApiName.CHANGE_EXTERNAL_USER_NICKNAME]: ChangeExternalUserNicknameConfig
  [ApiServerApiName.APPLY_QUOTA_FOR_WEKA_USAGE]: ApplyQuotaForWekaUsageApiConfig
  // ========================================= Monitor ========================================
  [ApiServerApiName.GET_GPU_DAILY_STATISTICS]: GetGpuDailyStatisticsApiConfig
  [ApiServerApiName.GET_NODES_PERFORMANCE]: GetNodesPerformanceApiConfig
  [ApiServerApiName.GET_NODES_SUMMARY_SERIES]: GetNodesSummarySeriesApiConfig
  [ApiServerApiName.GET_STORAGE_QUOTA]: GetStorageQuotaApiConfig
  [ApiServerApiName.GET_STORAGE_QUOTA_HISTORY]: GetStorageQuotaHistoryApiConfig
  [ApiServerApiName.USER_STORAGE_LIST]: GetUserPersonalStorageConfig
  [ApiServerApiName.CHAIN_PERF_SERIES]: ChainPerfSeriesConfig
  [ApiServerApiName.USER_STORAGE_WEKA_USAGE]: GetUserStorageUsageApiConfig
  [ApiServerApiName.USER_STORAGE_3FS_USAGE]: GetUserStorage3fsUsageApiConfig
  [ApiServerApiName.USER_STORAGE_3FS_CPU_USAGE]: GetUserStorage3fsCPUUsageApiConfig
  [ApiServerApiName.GET_EXTERNAL_USER_ACTIVENESS]: GetExternalUserActivenessApiConfig
  [ApiServerApiName.GET_EXTERNAL_USER_STORAGE_STAT]: GetExternalUserStorageStatApiConfig
  // ==================================== LOG_FOREST 日志大盘 ====================================
}

/**
 * Api Server API 路径
 */
export const API_SERVER_API_PATHS: Record<ApiServerApiName, string> = {
  // ========================================= Operating ========================================
  [ApiServerApiName.CREATE_USER]: 'operating/user/create',
  [ApiServerApiName.CREATE_TASK_V2]: 'operating/task/create',
  [ApiServerApiName.SERVICE_TASK_CREATE_V2]: 'operating/task/create', // 当前 service task 和普通 task 接口保持一致
  [ApiServerApiName.VALIDATE_TASK]: 'operating/task/validate',
  [ApiServerApiName.STOP_TASK]: 'operating/task/stop',
  [ApiServerApiName.RESUME_TASK]: 'operating/task/resume',
  [ApiServerApiName.SUSPEND_TASK]: 'operating/task/suspend',
  [ApiServerApiName.TAG_TASK]: 'operating/task/tag',
  [ApiServerApiName.UNTAG_TASK]: 'operating/task/untag',
  [ApiServerApiName.DELETE_TAGS]: 'operating/user/tag/delete',
  [ApiServerApiName.UPDATE_PRIORITY_API]: 'operating/task/priority/update',
  [ApiServerApiName.SERVICE_TASK_MOVE_NODE]: 'operating/service_task/move_node',
  [ApiServerApiName.SET_TRAINING_QUOTA]: 'operating/user/training_quota/update',
  [ApiServerApiName.UPDATE_USER_GROUP]: '/operating/user/group/update',
  [ApiServerApiName.SERVICE_TASK_DELETE]: 'operating/service_task/delete',
  [ApiServerApiName.SERVICE_TASK_CHECKPOINT]: 'operating/service_task/checkpoint',
  [ApiServerApiName.SET_EXTERNAL_USER_PRIORITY_QUOTA]:
    'operating/user/training_quota/update_external',
  [ApiServerApiName.TRAINING_QUOTA_LIMIT_UPDATE]: 'operating/user/training_quota_limit/update',
  [ApiServerApiName.SERVICE_TASK_RESTART]: 'operating/task/suspend', // 当前 service task 和普通 task 接口保持一致
  [ApiServerApiName.SERVICE_TASK_STOP]: 'operating/task/stop', // 当前 service task 和普通 task 接口保持一致
  [ApiServerApiName.CREATE_ACCESS_TOKEN]: 'operating/user/access_token/create',
  [ApiServerApiName.DELETE_ACCESS_TOKEN]: 'operating/user/access_token/delete',
  [ApiServerApiName.SERVICE_TASK_CONTROL]: 'operating/task/service_control',
  [ApiServerApiName.SET_EXTERNAL_USER_ACTIVE_STATE]: 'operating/user/update_external_active',
  [ApiServerApiName.SWITCH_SCHEDULE_ZONE]: 'operating/task/schedule_zone/update',
  [ApiServerApiName.SET_USER_ACTIVE_STATE]: 'operating/user/active/update',
  [ApiServerApiName.CHANGE_NODE_STATE]: 'operating/node/state/update',
  // ========================================= Query ==========================================
  [ApiServerApiName.GET_NODES_OVERVIEW]: 'query/node/overview',
  [ApiServerApiName.GET_RUNNING_TASKS]: 'query/task/list_all_unfinished',
  [ApiServerApiName.GET_TASKS_DISTRIBUTION]: 'query/task/schedule_zone_distribute',
  [ApiServerApiName.GET_TASKS_HISTORY]: 'query/optimized/tasks/history',
  [ApiServerApiName.GET_TASK_TAGS]: 'query/user/tag/list',
  [ApiServerApiName.GET_USER]: 'query/user/info',
  [ApiServerApiName.GET_USER_QUOTA]: 'query/user/training_quota/get_used',
  [ApiServerApiName.GET_USER_TASK]: 'query/task',
  [ApiServerApiName.GET_USER_TASKS]: 'query/task/list',
  [ApiServerApiName.GET_USERS]: 'query/user/list_all',
  [ApiServerApiName.GET_CLUSTER_OVERVIEW_FOR_CLIENT]: 'query/node/client_overview',
  [ApiServerApiName.GET_TIME_RANGE_SCHEDULE_INFO]: 'query/task/time_range_overview',
  [ApiServerApiName.GET_TASK_LOG]: 'query/task/log',
  [ApiServerApiName.GET_TASK_SYS_LOG]: 'query/task/sys_log',
  [ApiServerApiName.CLUSTER_DF]: 'query/node/list',
  [ApiServerApiName.SEARCH_IN_GLOBAL]: 'query/task/log/search',
  [ApiServerApiName.SERVICE_TASK_ALL_TASKS]: 'query/service_task/list_all',
  [ApiServerApiName.SERVICE_TASK_TASKS]: 'query/service_task/list',
  [ApiServerApiName.GET_EXTERNAL_USER_PRIORITY_QUOTA]:
    'query/user/training_quota/external_list_all',
  [ApiServerApiName.GET_INTERNAL_USER_PRIORITY_QUOTA]:
    'query/user/training_quota/internal_list_all',
  [ApiServerApiName.LIST_ACCESS_TOKEN]: 'query/user/access_token/list',
  [ApiServerApiName.GET_TASK_CONTAINER_MONITOR_STATS]: 'query/task/container_monitor_stats/list',
  [ApiServerApiName.GET_ALL_USER_NODE_QUOTA]: 'query/user/training_quota/list_all',
  // ========================================= Ugc ============================================
  [ApiServerApiName.LIST_CLUSTER_FILES]: 'ugc/cloud/cluster_files/list',
  [ApiServerApiName.NODE_PORT_SVC]: 'ugc/user/nodeport/create',
  [ApiServerApiName.DELETE_NODE_PORT_SVC]: 'ugc/user/nodeport/delete',
  [ApiServerApiName.GET_SYNC_STATUS]: 'ugc/get_sync_status',
  [ApiServerApiName.GET_TRAIN_IMAGES]: 'ugc/user/train_image/list',
  [ApiServerApiName.ARCHIVE_EXTERNAL_USER]: '/ugc/archive_external_user',
  [ApiServerApiName.CHANGE_EXTERNAL_USER_NICKNAME]: '/ugc/change_external_user_nickname',
  [ApiServerApiName.APPLY_QUOTA_FOR_WEKA_USAGE]: 'ugc/apply_quota_for_weka_usage',
  // ========================================= Monitor ========================================
  [ApiServerApiName.GET_GPU_DAILY_STATISTICS]: 'monitor_v2/daily_stats',
  [ApiServerApiName.GET_NODES_PERFORMANCE]: 'monitor_v2/performance',
  [ApiServerApiName.GET_NODES_SUMMARY_SERIES]: 'monitor_v2/get_node_summary_series',
  [ApiServerApiName.GET_STORAGE_QUOTA]: 'monitor_v2/storage_quota',
  [ApiServerApiName.GET_STORAGE_QUOTA_HISTORY]: 'monitor_v2/get_history_storage_stat',
  [ApiServerApiName.USER_STORAGE_LIST]: 'monitor/user/storage/list',
  [ApiServerApiName.CHAIN_PERF_SERIES]: 'monitor/task/chain_perf_series',
  [ApiServerApiName.USER_STORAGE_WEKA_USAGE]: 'monitor_v2/user/storage/weka_usage',
  [ApiServerApiName.USER_STORAGE_3FS_USAGE]: 'monitor_v2/user/storage/3fs_usage',
  [ApiServerApiName.USER_STORAGE_3FS_CPU_USAGE]: 'monitor_v2/user/storage/3fs_cpu_usage',
  [ApiServerApiName.GET_EXTERNAL_USER_ACTIVENESS]: 'monitor_v2/get_external_user_activeness',
  [ApiServerApiName.GET_EXTERNAL_USER_STORAGE_STAT]: 'monitor_v2/get_external_user_storage_stat',
  // ==================================== LOG_FOREST 日志大盘 ====================================
}

/**
 * 不满足 success/result 格式的接口，新接口请不要加到这里了
 */
export const API_SERVER_CONVERT_PATHS = [
  // ========================================= Operating ========================================
  'operating/create_task',
  'operating/task/create',
  'operating/task/validate',
  'operating/task/stop',
  'operating/task/resume',
  'operating/task/tag',
  'operating/task/untag',
  'operating/task/priority/update',
  // ========================================= Query ==========================================
  'query/task/log',
  'query/task/sys_log',
  'query/node/list',
  'query/get_worker_user_info',
  'query/task/log/search',
  'query/user/training_quota/external_list_all',
  'query/user/training_quota/internal_list_all',
  // ========================================= Ugc ============================================
  'ugc/cloud/cluster_files/list',
  'ugc/get_sync_status',
  'ugc/change_external_user_nickname',
  // ========================================= Monitor ========================================
  'monitor_v2/daily_stats',
  'monitor_v2/performance',
  'monitor_v2/get_node_summary_series',
  'monitor_v2/storage_quota',
  'monitor_v2/get_history_storage_stat',
  'monitor/user/storage/list',
  'monitor/task/chain_perf_series',
  'monitor_v2/get_external_user_activeness',
  // ==================================== LOG_FOREST 日志大盘 ====================================
]

/**
 * 需要对 Config 做额外转换的接口，以及他们的 handler:
 * 如果需要把 Post 改成 Get，在这里声明一下
 */
export const API_CONFIG_HANDLERS = {
  [ApiServerApiName.VALIDATE_TASK]: ValidateTaskRequestConfigHandler,
  [ApiServerApiName.USER_STORAGE_WEKA_USAGE]: MethodToGetHandler,
  [ApiServerApiName.USER_STORAGE_3FS_USAGE]: MethodToGetHandler,
  [ApiServerApiName.USER_STORAGE_3FS_CPU_USAGE]: MethodToGetHandler,
}

export type OriginUrlConverter = (config: HttpRequestConfig) => string

export const ORIGIN_URL_CONVERTERS: Record<string, OriginUrlConverter> = {}
