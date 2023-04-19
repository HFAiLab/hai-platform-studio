import type {
  AboutMeInfoApiConfig,
  ArchiveExternalUserConfig,
  CheckUserApiConfig,
  ClusterMessageApiConfig,
  CurrentTasksInfoApiConfig,
  DataUsageSummaryApiConfig,
  DatasetAddMemoConfig,
  DatasetConfirmDataUpdatedConfig,
  DatasetCreatePrivateDatasetConfig,
  DatasetDeleteDatasetConfig,
  DatasetDoStageActionConfig,
  DatasetGetAllDatasetItemsConfig,
  DatasetGetRunningJobProgressConfig,
  DatasetGetSyncInfoConfig,
  DatasetRequestSTSTokenConfig,
  DatasetUpdateDatasetConfig,
  DatasetUpdatePathConfig,
  DatasetUpdateStorageLocationConfig,
  DatasetUserUpdatePrivateDatasetConfig,
  ExternalUserStorageUsageApiConfig,
  GetAllInternalExternalUserNameApiConfig,
  GetArchiveTaskLogConfig,
  GetConfigTextApiConfig,
  GetDailyStatsApiConfig,
  GetExternalAccountListsApiConfig,
  GetExternalClusterOverviewApiConfig,
  GetExternalUserActivityConfig,
  GetExternalUserInfoApiConfig,
  GetExternalUserStorageStatApiConfig,
  GetLatestAppVersionConfig,
  GetNodeUsageSeriesApiConfig,
  GetNodes3fsIoApiConfig,
  GetReportDataApiConfig,
  GetReportDataListApiConfig,
  GetTaskCurrentPerfV2ApiConfig,
  GetTaskTypedOverviewApiConfig,
  GetTop10NodeUsageByZoneApiConfig,
  GetUsers3fsIoApiConfig,
  GetYinghuoStatsByUserApiConfig,
  LogInsertDetailApiConfig,
  LogUserInsertDetailApiConfig,
  QueryShouldUploadApiConfig,
  SafeGetUserInfoApiConfig,
  SetConfigTextApiConfig,
  SetExternalUserActiveStateConfig,
  SocketControlDeleteTaskCacheApiConfig,
  StopArchiveTaskConfig,
  TomlParseConfig,
  TomlStringifyConfig,
  UserNodeQuotaInfoApiConfig,
  XTopicBlogQueryListConfig,
  XTopicBlogSyncConfig,
  XTopicCarouselListConfig,
  XTopicLikeAddConfig,
  XTopicMeiliSearchAvailableConfig,
  XTopicMeiliSearchBasicSearchConfig,
  XTopicNotificationDeleteConfig,
  XTopicNotificationInsertConfig,
  XTopicNotificationListConfig,
  XTopicNotificationMassSendingHistoryListConfig,
  XTopicNotificationSendMassConfig,
  XTopicNotificationTriggerInsertConfig,
  XTopicNotificationTriggerListConfig,
  XTopicNotificationTriggerSendedConfig,
  XTopicNotificationTriggerUpdateConfig,
  XTopicNotificationUnreadConfig,
  XTopicPostDeleteConfig,
  XTopicPostDetailConfig,
  XTopicPostInsertConfig,
  XTopicPostListConfig,
  XTopicPostSuggestListConfig,
  XTopicPostVisitConfig,
  XTopicReplyDeleteConfig,
  XTopicReplyInsertConfig,
  XTopicReplyListConfig,
  XTopicReportInsertConfig,
  XTopicTopContentListConfig,
  XTopicTopTagListConfig,
  XTopicUserDetailConfig,
  XTopicUserUpdateConfig,
  YamlParseConfig,
  YamlStringifyConfig,
} from './api'

/**
 * AILab Server API 名称
 *
 * 命名规范：
 * AILab Server 本身采用 3 级路由，即：文件 - 模块 - 具体内容
 * 这里为了统一，同时具有一定的便捷性，我们命名上建议以 '文件 - 具体内容' 两级命名即可
 * 注意：不同的文件是可以配置起到不同的 Pod 中的，所以对于 monitor 相关的，最好都是在 monitor_api 里面
 *
 */
export enum AilabServerApiName {
  /**
   * 获取全部用户 3FS IO
   */
  GET_USERS_3FS_IO = 'GET_USERS_3FS_IO',

  /**
   * 获取全部节点 3FS IO
   */
  GET_NODES_3FS_IO = 'GET_NODES_3FS_IO',

  /**
   * 获取前 10 用户的节点使用 (分 AB 区)
   */
  GET_TOP10_NODE_USAGE_BY_ZONE = 'GET_TOP10_NODE_USAGE_BY_ZONE',

  /**
   * 获取当前应用的最新版本：请优先使用 TRAININGS_GET_LATEST_APP_VERSION
   */
  INTERNAL_PLATFORM_GET_LATEST_APP_VERSION = 'INTERNAL_PLATFORM_GET_LATEST_APP_VERSION',

  /**
   * 获取当前应用的最新版本
   */
  TRAININGS_GET_LATEST_APP_VERSION = 'TRAININGS_GET_LATEST_APP_VERSION',

  /**
   * 安全的获取用户信息
   * */
  TRAININGS_SAFE_GET_USER_INFO = 'TRAININGS_SAFE_GET_USER_INFO',

  /**
   * 查询全局任务信息
   */
  GET_TASK_TYPED_OVERVIEW = 'GET_TASK_TYPED_OVERVIEW',

  /**
   * 外部用户的集群概况
   */
  GET_EXTERNAL_CLUSTER_OVERVIEW = 'GET_EXTERNAL_CLUSTER_OVERVIEW',

  /**
   * 查询节点用量序列
   */
  GET_NODE_USAGE_SERIES = 'GET_NODE_USAGE_SERIES',

  /**
   * 获取用户使用的和总的 quota 信息
   */
  TRAININGS_USER_NODE_QUOTA_INFO = 'TRAININGS_USER_NODE_QUOTA_INFO',

  /**
   * 获取配置文本
   */
  TRAININGS_GET_CONFIG_TEXT = 'TRAININGS_GET_CONFIG_TEXT',

  /**
   * 获取用户头像分组开通时间等级等信息
   */
  TRAININGS_ABOUT_ME_INFO = 'TRAININGS_ABOUT_ME_INFO',

  /**
   * 上传日志，是由于管理员申请回捞触发的日志上传
   */
  TRAININGS_LOG_INSERT_DETAIL = 'TRAININGS_LOG_INSERT_DETAIL',

  /**
   * 上传日志，是由于用户主动上传回捞触发的日志上传
   */
  TRAININGS_LOG_USER_INSERT_DETAIL = 'TRAININGS_LOG_USER_INSERT_DETAIL',

  /**
   * 获取外部用户存储用量（比 weka usage 更精确的版本）
   */
  TRAININGS_EXTERNAL_USER_STORAGE_USAGE = 'TRAININGS_EXTERNAL_USER_STORAGE_USAGE',

  /**
   * 获取当前实验的排队等状态
   */
  TRAININGS_CURRENT_TASK_INFO = 'TRAININGS_CURRENT_TASK_INFO',

  /**
   * 设置 studio 用户配置
   */
  TRAININGS_SET_CONFIG_TEXT = 'TRAININGS_SET_CONFIG_TEXT',

  /**
   * 获取训练相关的统计指标
   */
  TRAININGS_GET_REPORT_DATA = 'TRAININGS_GET_REPORT_DATA',

  /**
   * 获取训练相关的统计指标列表（一段时间内）
   */

  TRAININGS_GET_REPORT_DATA_LIST = 'TRAININGS_GET_REPORT_DATA_LIST',

  /**
   * 删除 socket 长链接的 task 缓存
   */
  SOCKET_CONTROL_DELETE_TASK_CACHE = 'SOCKET_CONTROL_DELETE_TASK_CACHE',

  /**
   * 确认是否需要上传日志
   */
  QUERY_SHOULD_UPLOAD = 'QUERY_SHOULD_UPLOAD',

  /**
   * 获取集群的通知消息
   */
  CLUSTER_MESSAGE = 'CLUSTER_MESSAGE',

  /**
   * 获取外部用户总用量统计的接口，用于 studio 首页面板
   */
  DATA_USAGE_SUMMARY = 'DATA_USAGE_SUMMARY',

  /**
   * 获取所有数据集信息
   */
  DATASET_GET_ALL_DATASET_ITEMS = 'DATASET_GET_ALL_DATASET_ITEMS',

  /**
   * 修改数据集内容
   */
  DATASET_UPDATE_DATASET = 'DATASET_UPDATE_DATASET',

  /**
   * 用户自行修改私有数据集部分内容
   */
  DATASET_USER_UPDATE_PRIVATE_DATASET = 'DATASET_USER_UPDATE_PRIVATE_DATASET',

  /**
   * 删除数据集内容
   */
  DATASET_DELETE_DATASET = 'DATASET_DELETE_DATASET',

  /**
   * 创建私有数据集
   */
  DATASET_CREATE_PRIVATE_DATASET = 'DATASET_CREATE_PRIVATE_DATASET',

  /**
   * 请求 OSS 的 STS 临时授权
   */
  DATASET_REQUEST_STS_TOKEN = 'DATASET_REQUEST_STS_TOKEN',

  /**
   * 添加数据集备注
   */
  DATASET_ADD_MEMO = 'DATASET_ADD_MEMO',

  /**
   * 用户确认数据更新完成
   */
  DATASET_CONFIRM_DATA_UPDATED = 'DATASET_CONFIRM_DATA_UPDATED',

  /**
   * 执行每个 stage 的对应动作
   */
  DATASET_DO_STAGE_ACTION = 'DATASET_DO_STAGE_ACTION',

  /**
   * 获取正在运行中的 Job 的信息
   */
  DATASET_GET_RUNNING_JOB_PROGRESS = 'DATASET_GET_RUNNING_JOB_PROGRESS',

  /**
   * 获取数据集，stage，job，log 等同步流程信息
   */
  DATASET_GET_SYNC_INFO = 'DATASET_GET_SYNC_INFO',

  /**
   * 手动更改数据集的路径
   */
  DATASET_UPDATE_PATH = 'DATASET_UPDATE_PATH',

  /**
   * 更新数据集存放设置
   */
  DATASET_UPDATE_STORAGE_LOCATION = 'DATASET_UPDATE_STORAGE_LOCATION',

  /**
   * 获取外部用户中文信息
   */
  GET_EXTERNAL_USER_INFO = 'GET_EXTERNAL_USER_INFO',

  /**
   * 获取外部用户信息列表
   */
  GET_EXTERNAL_ACCOUNT_LIST = 'GET_EXTERNAL_ACCOUNT_LIST',

  /**
   * 获取指定用户的萤火报表多天数据
   */
  GET_YINGHUO_STATS_BY_USER = 'GET_YINGHUO_STATS_BY_USER',

  /**
   * 获取用户活跃情况
   */
  GET_EXTERNAL_USER_ACTIVITY = 'GET_EXTERNAL_USER_ACTIVITY',

  /**
   * 获取归档任务的日志
   */
  GET_ARCHIVE_TASK_LOG = 'GET_ARCHIVE_TASK_LOG',

  /**
   * 停止归档任务
   */
  STOP_ARCHIVE_TASK = 'STOP_ARCHIVE_TASK',

  /**
   * 归档外部用户
   */
  ARCHIVE_EXTERNAL_USER = 'ARCHIVE_EXTERNAL_USER',

  /**
   * 外部用户存储用量统计
   */
  GET_EXTERNAL_USER_STORAGE_STAT = 'GET_EXTERNAL_USER_STORAGE_STAT',

  /**
   * 设置用户激活状态
   */
  SET_EXTERNAL_USER_ACTIVE_STATE = 'SET_EXTERNAL_USER_ACTIVE_STATE',

  // 话题相关：
  /**
   * 发布一个话题
   */
  XTOPIC_POST_INSERT = 'XTOPIC_POST_INSERT',
  /**
   * 获取话题列表
   */
  XTOPIC_POST_LIST = 'XTOPIC_POST_LIST',

  /**
   * 获取话题详情，单条内容会多一些
   */
  XTOPIC_POST_DETAIL = 'XTOPIC_POST_DETAIL',

  /**
   * 话题访问上报
   */
  XTOPIC_POST_VISIT = 'XTOPIC_POST_VISIT',

  /**
   * 获取评论列表
   */
  XTOPIC_REPLY_LIST = 'XTOPIC_REPLY_LIST',

  /**
   * 获取外露的 Tags
   */
  XTOPIC_TOP_TAG_LIST = 'XTOPIC_TOP_TAG_LIST',

  /**
   * 点赞调用的接口
   */
  XTOPIC_LIKE_ADD = 'XTOPIC_LIKE_ADD',

  /**
   * 获取滚动轮播列表
   */
  XTOPIC_CAROUSEL_LIST = 'XTOPIC_CAROUSEL_LIST',

  /**
   * 获取置顶内容列表
   */
  XTOPIC_TOP_CONTENT_LIST = 'XTOPIC_TOP_CONTENT_LIST',

  /**
   * 举报帖子或者回帖
   */
  XTOPIC_REPORT_INSERT = 'XTOPIC_REPORT_INSERT',

  /**
   * 回帖
   */
  XTOPIC_REPLY_INSERT = 'XTOPIC_REPLY_INSERT',

  /**
   * 获取话题用户信息
   */
  XTOPIC_USER_DETAIL = 'XTOPIC_USER_DETAIL',

  /**
   * 更新话题用户信息
   */
  XTOPIC_USER_UPDATE = 'XTOPIC_USER_UPDATE',

  /*
   * 建议的帖子，用于快速引用
   */
  XTOPIC_POST_SUGGEST_LIST = 'XTOPIC_POST_SUGGEST_LIST',

  /*
   * 获取通用性能数据
   */
  GET_TASK_CURRENT_PERF_V2 = 'GET_TASK_CURRENT_PERF_V2',

  /*
   * 获取所有外部用户和内部用户的用户名
   */
  GET_ALL_INTERNAL_EXTERNAL_USER_NAME = 'GET_ALL_INTERNAL_EXTERNAL_USER_NAME',

  /**
   * 获取每日报表数据
   */
  GET_DAILY_STATS = 'GET_DAILY_STATS',

  /*
   * 删除帖子
   */
  XTOPIC_POST_DELETE = 'XTOPIC_POST_DELETE',

  /*
   * 删除回帖
   */
  XTOPIC_REPLY_DELETE = 'XTOPIC_REPLY_DELETE',

  /**
   * toml 字符串 -> 对象
   */
  TOML_PARSE = 'TOML_PARSE',

  /**
   * toml 对象 -> 字符串
   */
  TOML_STRINGIFY = 'TOML_STRINGIFY',

  /**
   * yaml 字符串 -> 对象
   */
  YAML_PARSE = 'YAML_PARSE',

  /**
   * yaml 对象 -> 字符串
   */
  YAML_STRINGIFY = 'YAML_STRINGIFY',

  /**
   * 获取用户通知列表
   */
  XTOPIC_NOTIFICATION_LIST = 'XTOPIC_NOTIFICATION_LIST',

  /**
   * 手动增加新通知
   */
  XTOPIC_NOTIFICATION_INSERT = 'XTOPIC_NOTIFICATION_INSERT',

  /**
   * 删除通知
   */
  XTOPIC_NOTIFICATION_DELETE = 'XTOPIC_NOTIFICATION_DELETE',

  /**
   * 未读通知数
   */
  XTOPIC_NOTIFICATION_UNREAD = 'XTOPIC_NOTIFICATION_UNREAD',

  /**
   * 群发通知
   */
  XTOPIC_NOTIFICATION_SEND_MASS = 'XTOPIC_NOTIFICATION_SEND_MASS',

  /**
   * 获取群发历史
   */
  XTOPIC_NOTIFICATION_MASS_SENDING_HISTORY = 'XTOPIC_NOTIFICATION_MASS_SENDING_HISTORY',

  /**
   * 新建消息触发器
   */
  XTOPIC_NOTIFICATION_TRIGGER_INSERT = 'XTOPIC_NOTIFICATION_TRIGGER_INSERT',

  /**
   * 查看消息触发器
   */
  XTOPIC_NOTIFICATION_TRIGGER_LIST = 'XTOPIC_NOTIFICATION_TRIGGER_LIST',

  /**
   * 更新消息触发器
   */
  XTOPIC_NOTIFICATION_TRIGGER_UPDATE = 'XTOPIC_NOTIFICATION_TRIGGER_UPDATE',

  /**
   * 查找该触发器发出的消息
   */
  XTOPIC_NOTIFICATION_TRIGGER_SENDED = 'XTOPIC_NOTIFICATION_TRIGGER_SENDED',

  /**
   * 查询官网博客列表
   */
  XTOPIC_BLOG_QUERY_LIST = 'XTOPIC_BLOG_QUERY_LIST',

  /**
   * 官网博客同步操作
   */
  XTOPIC_BLOG_SYNC = 'XTOPIC_BLOG_SYNC',

  /**
   * 是否可以用 MeiliSearch
   */
  XTOPIC_MEILI_SEARCH_AVAILABLE = 'XTOPIC_MEILI_SEARCH_AVAILABLE',

  /**
   * 基本的搜索获取列表
   */
  XTOPIC_MEILI_SEARCH_BASIC_SEARCH = 'XTOPIC_MEILI_SEARCH_BASIC_SEARCH',

  /**
   * 检查用户是否可以登录
   */
  LOGIN_CHECK_USER = 'LOGIN_CHECK_USER',
}

/**
 * AILab Server API 类型配置
 */
export interface AilabServerApiConfigMap {
  [AilabServerApiName.GET_USERS_3FS_IO]: GetUsers3fsIoApiConfig
  [AilabServerApiName.GET_NODES_3FS_IO]: GetNodes3fsIoApiConfig
  [AilabServerApiName.GET_TOP10_NODE_USAGE_BY_ZONE]: GetTop10NodeUsageByZoneApiConfig
  [AilabServerApiName.INTERNAL_PLATFORM_GET_LATEST_APP_VERSION]: GetLatestAppVersionConfig
  [AilabServerApiName.TRAININGS_GET_LATEST_APP_VERSION]: GetLatestAppVersionConfig
  [AilabServerApiName.TRAININGS_SAFE_GET_USER_INFO]: SafeGetUserInfoApiConfig
  [AilabServerApiName.TRAININGS_ABOUT_ME_INFO]: AboutMeInfoApiConfig
  [AilabServerApiName.TRAININGS_EXTERNAL_USER_STORAGE_USAGE]: ExternalUserStorageUsageApiConfig
  [AilabServerApiName.SOCKET_CONTROL_DELETE_TASK_CACHE]: SocketControlDeleteTaskCacheApiConfig
  [AilabServerApiName.GET_TASK_TYPED_OVERVIEW]: GetTaskTypedOverviewApiConfig
  [AilabServerApiName.GET_EXTERNAL_CLUSTER_OVERVIEW]: GetExternalClusterOverviewApiConfig
  [AilabServerApiName.GET_NODE_USAGE_SERIES]: GetNodeUsageSeriesApiConfig
  [AilabServerApiName.GET_TASK_CURRENT_PERF_V2]: GetTaskCurrentPerfV2ApiConfig
  [AilabServerApiName.GET_ALL_INTERNAL_EXTERNAL_USER_NAME]: GetAllInternalExternalUserNameApiConfig
  [AilabServerApiName.GET_DAILY_STATS]: GetDailyStatsApiConfig
  [AilabServerApiName.TRAININGS_GET_CONFIG_TEXT]: GetConfigTextApiConfig
  [AilabServerApiName.QUERY_SHOULD_UPLOAD]: QueryShouldUploadApiConfig
  [AilabServerApiName.CLUSTER_MESSAGE]: ClusterMessageApiConfig
  [AilabServerApiName.TRAININGS_USER_NODE_QUOTA_INFO]: UserNodeQuotaInfoApiConfig
  [AilabServerApiName.TRAININGS_LOG_INSERT_DETAIL]: LogInsertDetailApiConfig
  [AilabServerApiName.TRAININGS_LOG_USER_INSERT_DETAIL]: LogUserInsertDetailApiConfig
  [AilabServerApiName.TRAININGS_CURRENT_TASK_INFO]: CurrentTasksInfoApiConfig
  [AilabServerApiName.TRAININGS_SET_CONFIG_TEXT]: SetConfigTextApiConfig
  [AilabServerApiName.TRAININGS_GET_REPORT_DATA]: GetReportDataApiConfig
  [AilabServerApiName.TRAININGS_GET_REPORT_DATA_LIST]: GetReportDataListApiConfig

  // DataPanel
  [AilabServerApiName.DATA_USAGE_SUMMARY]: DataUsageSummaryApiConfig
  // datasets
  [AilabServerApiName.DATASET_GET_ALL_DATASET_ITEMS]: DatasetGetAllDatasetItemsConfig
  [AilabServerApiName.DATASET_UPDATE_DATASET]: DatasetUpdateDatasetConfig
  [AilabServerApiName.DATASET_DELETE_DATASET]: DatasetDeleteDatasetConfig
  [AilabServerApiName.DATASET_CREATE_PRIVATE_DATASET]: DatasetCreatePrivateDatasetConfig
  [AilabServerApiName.DATASET_REQUEST_STS_TOKEN]: DatasetRequestSTSTokenConfig
  [AilabServerApiName.DATASET_ADD_MEMO]: DatasetAddMemoConfig
  [AilabServerApiName.DATASET_CONFIRM_DATA_UPDATED]: DatasetConfirmDataUpdatedConfig
  [AilabServerApiName.DATASET_DO_STAGE_ACTION]: DatasetDoStageActionConfig
  [AilabServerApiName.DATASET_GET_RUNNING_JOB_PROGRESS]: DatasetGetRunningJobProgressConfig
  [AilabServerApiName.DATASET_GET_SYNC_INFO]: DatasetGetSyncInfoConfig
  [AilabServerApiName.DATASET_UPDATE_PATH]: DatasetUpdatePathConfig
  [AilabServerApiName.DATASET_UPDATE_STORAGE_LOCATION]: DatasetUpdateStorageLocationConfig
  [AilabServerApiName.DATASET_USER_UPDATE_PRIVATE_DATASET]: DatasetUserUpdatePrivateDatasetConfig
  // admin
  [AilabServerApiName.GET_EXTERNAL_USER_INFO]: GetExternalUserInfoApiConfig
  [AilabServerApiName.GET_EXTERNAL_ACCOUNT_LIST]: GetExternalAccountListsApiConfig
  [AilabServerApiName.GET_EXTERNAL_USER_ACTIVITY]: GetExternalUserActivityConfig
  [AilabServerApiName.GET_ARCHIVE_TASK_LOG]: GetArchiveTaskLogConfig
  [AilabServerApiName.STOP_ARCHIVE_TASK]: StopArchiveTaskConfig
  [AilabServerApiName.ARCHIVE_EXTERNAL_USER]: ArchiveExternalUserConfig
  [AilabServerApiName.GET_EXTERNAL_USER_STORAGE_STAT]: GetExternalUserStorageStatApiConfig
  [AilabServerApiName.GET_YINGHUO_STATS_BY_USER]: GetYinghuoStatsByUserApiConfig

  // 话题
  [AilabServerApiName.XTOPIC_POST_INSERT]: XTopicPostInsertConfig
  [AilabServerApiName.XTOPIC_POST_LIST]: XTopicPostListConfig
  [AilabServerApiName.XTOPIC_POST_DETAIL]: XTopicPostDetailConfig
  [AilabServerApiName.XTOPIC_POST_VISIT]: XTopicPostVisitConfig
  [AilabServerApiName.XTOPIC_REPLY_LIST]: XTopicReplyListConfig
  [AilabServerApiName.XTOPIC_TOP_TAG_LIST]: XTopicTopTagListConfig
  [AilabServerApiName.XTOPIC_LIKE_ADD]: XTopicLikeAddConfig
  [AilabServerApiName.XTOPIC_CAROUSEL_LIST]: XTopicCarouselListConfig
  [AilabServerApiName.XTOPIC_TOP_CONTENT_LIST]: XTopicTopContentListConfig
  [AilabServerApiName.XTOPIC_REPORT_INSERT]: XTopicReportInsertConfig
  [AilabServerApiName.XTOPIC_REPLY_INSERT]: XTopicReplyInsertConfig
  [AilabServerApiName.XTOPIC_USER_DETAIL]: XTopicUserDetailConfig
  [AilabServerApiName.XTOPIC_USER_UPDATE]: XTopicUserUpdateConfig
  [AilabServerApiName.XTOPIC_POST_SUGGEST_LIST]: XTopicPostSuggestListConfig
  [AilabServerApiName.XTOPIC_POST_DELETE]: XTopicPostDeleteConfig
  [AilabServerApiName.XTOPIC_REPLY_DELETE]: XTopicReplyDeleteConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_LIST]: XTopicNotificationListConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_INSERT]: XTopicNotificationInsertConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_DELETE]: XTopicNotificationDeleteConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_UNREAD]: XTopicNotificationUnreadConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_SEND_MASS]: XTopicNotificationSendMassConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_MASS_SENDING_HISTORY]: XTopicNotificationMassSendingHistoryListConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_LIST]: XTopicNotificationTriggerListConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_INSERT]: XTopicNotificationTriggerInsertConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_UPDATE]: XTopicNotificationTriggerUpdateConfig
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_SENDED]: XTopicNotificationTriggerSendedConfig
  [AilabServerApiName.TOML_PARSE]: TomlParseConfig
  [AilabServerApiName.TOML_STRINGIFY]: TomlStringifyConfig
  [AilabServerApiName.YAML_PARSE]: YamlParseConfig
  [AilabServerApiName.YAML_STRINGIFY]: YamlStringifyConfig
  [AilabServerApiName.SET_EXTERNAL_USER_ACTIVE_STATE]: SetExternalUserActiveStateConfig
  [AilabServerApiName.XTOPIC_BLOG_QUERY_LIST]: XTopicBlogQueryListConfig
  [AilabServerApiName.XTOPIC_BLOG_SYNC]: XTopicBlogSyncConfig
  [AilabServerApiName.XTOPIC_MEILI_SEARCH_BASIC_SEARCH]: XTopicMeiliSearchBasicSearchConfig
  [AilabServerApiName.XTOPIC_MEILI_SEARCH_AVAILABLE]: XTopicMeiliSearchAvailableConfig

  // 登录
  [AilabServerApiName.LOGIN_CHECK_USER]: CheckUserApiConfig
}

/**
 * AILab Server API 路径
 */
export const AILAB_SERVER_API_PATHS: Record<AilabServerApiName, string> = {
  [AilabServerApiName.GET_USERS_3FS_IO]: 'monitor_api/3fs/get_3fs_user_io',
  [AilabServerApiName.GET_NODES_3FS_IO]: 'monitor_api/3fs/get_3fs_node_io',
  [AilabServerApiName.GET_TOP10_NODE_USAGE_BY_ZONE]:
    'monitor_api/grafana/get_top10_node_usage_series_by_zone',
  [AilabServerApiName.INTERNAL_PLATFORM_GET_LATEST_APP_VERSION]:
    'internal_platform/app_version/get_latest_app_version',
  [AilabServerApiName.TRAININGS_GET_LATEST_APP_VERSION]:
    'trainings/app_version/get_latest_app_version',
  [AilabServerApiName.TRAININGS_SAFE_GET_USER_INFO]: 'trainings/user/safe_get_user_info',
  [AilabServerApiName.TRAININGS_ABOUT_ME_INFO]: 'trainings/user/about_me_info',
  [AilabServerApiName.TRAININGS_EXTERNAL_USER_STORAGE_USAGE]:
    'trainings/data_panel/external_user_storage_usage',
  [AilabServerApiName.SOCKET_CONTROL_DELETE_TASK_CACHE]:
    'trainings/socket_control/delete_task_cache',
  [AilabServerApiName.GET_TASK_TYPED_OVERVIEW]: 'trainings/data_panel/get_tasks_typed_overview',
  [AilabServerApiName.GET_EXTERNAL_CLUSTER_OVERVIEW]:
    'trainings/data_panel/get_external_cluster_overview',
  [AilabServerApiName.GET_NODE_USAGE_SERIES]: 'trainings/data_panel/get_node_usage_series',
  [AilabServerApiName.GET_TASK_CURRENT_PERF_V2]: 'trainings/perf/get_task_current_perf_v2',
  [AilabServerApiName.GET_ALL_INTERNAL_EXTERNAL_USER_NAME]:
    'studio_admin/all_user/get_all_internal_external_user_name',
  [AilabServerApiName.GET_DAILY_STATS]: 'studio_admin/yinghuo_status/get_daily_stats',
  [AilabServerApiName.GET_YINGHUO_STATS_BY_USER]:
    'studio_admin/yinghuo_status/yinghuo_stats_by_user',
  [AilabServerApiName.TRAININGS_GET_CONFIG_TEXT]: 'trainings/user_config/get_config_text',
  [AilabServerApiName.QUERY_SHOULD_UPLOAD]: 'trainings/log_upload/query_should_upload',
  [AilabServerApiName.CLUSTER_MESSAGE]: 'trainings/user/cluster_message',
  [AilabServerApiName.TRAININGS_USER_NODE_QUOTA_INFO]: 'trainings/data_panel/user_node_quota_info',
  [AilabServerApiName.DATA_USAGE_SUMMARY]: 'trainings/data_panel/get_external_usage_summary',
  [AilabServerApiName.TRAININGS_LOG_INSERT_DETAIL]: `trainings/log_upload/insert_detail`,
  [AilabServerApiName.TRAININGS_LOG_USER_INSERT_DETAIL]: `trainings/log_upload/user_insert_detail`,
  [AilabServerApiName.TRAININGS_CURRENT_TASK_INFO]: 'trainings/data_panel/current_tasks_info',
  [AilabServerApiName.TRAININGS_SET_CONFIG_TEXT]: 'trainings/user_config/set_config_text',
  [AilabServerApiName.TRAININGS_GET_REPORT_DATA]: 'trainings/data_panel/get_report_data',
  [AilabServerApiName.TRAININGS_GET_REPORT_DATA_LIST]: 'trainings/data_panel/get_report_data_list',

  // datasets
  [AilabServerApiName.DATASET_GET_ALL_DATASET_ITEMS]: 'dataset/dataset_item/all_dataset_items',
  [AilabServerApiName.DATASET_UPDATE_DATASET]: 'dataset/dataset_item/update_dataset',
  [AilabServerApiName.DATASET_USER_UPDATE_PRIVATE_DATASET]:
    'dataset/dataset_item/user_update_private_dataset',
  [AilabServerApiName.DATASET_DELETE_DATASET]: 'dataset/dataset_item/delete_dataset',
  [AilabServerApiName.DATASET_CREATE_PRIVATE_DATASET]:
    'dataset/dataset_item/create_private_dataset',
  [AilabServerApiName.DATASET_REQUEST_STS_TOKEN]: 'dataset/dataset_item/request_sts_token',
  [AilabServerApiName.DATASET_ADD_MEMO]: 'dataset/data_sync/add_memo',
  [AilabServerApiName.DATASET_CONFIRM_DATA_UPDATED]: 'dataset/data_sync/confirm_data_updated',
  [AilabServerApiName.DATASET_DO_STAGE_ACTION]: 'dataset/data_sync/do_stage_action',
  [AilabServerApiName.DATASET_GET_RUNNING_JOB_PROGRESS]:
    'dataset/data_sync/get_running_job_progress',
  [AilabServerApiName.DATASET_GET_SYNC_INFO]: 'dataset/data_sync/get_sync_info',
  [AilabServerApiName.DATASET_UPDATE_PATH]: 'dataset/data_sync/update_path',
  [AilabServerApiName.DATASET_UPDATE_STORAGE_LOCATION]: 'dataset/data_sync/update_storage_location',
  // external users
  [AilabServerApiName.GET_EXTERNAL_USER_INFO]:
    'studio_admin/external_account/get_external_user_info',
  [AilabServerApiName.GET_EXTERNAL_ACCOUNT_LIST]: 'studio_admin/external_account/get_accounts_list',
  [AilabServerApiName.GET_EXTERNAL_USER_ACTIVITY]:
    'studio_admin/external_activity/get_external_activity',
  [AilabServerApiName.SET_EXTERNAL_USER_ACTIVE_STATE]:
    'studio_admin/external_activity/set_external_active_state',
  [AilabServerApiName.GET_ARCHIVE_TASK_LOG]: 'studio_admin/external_activity/get_archive_task_log',
  [AilabServerApiName.STOP_ARCHIVE_TASK]: 'studio_admin/external_activity/stop_archive_task',
  [AilabServerApiName.ARCHIVE_EXTERNAL_USER]:
    'studio_admin/external_activity/archive_external_user',
  [AilabServerApiName.GET_EXTERNAL_USER_STORAGE_STAT]:
    'studio_admin/external_storage/get_external_user_storage_stat',
  // 话题
  [AilabServerApiName.XTOPIC_POST_INSERT]: 'xtopic/post/insert',
  [AilabServerApiName.XTOPIC_POST_LIST]: 'xtopic/post/list',
  [AilabServerApiName.XTOPIC_POST_VISIT]: 'xtopic/post/visit',
  [AilabServerApiName.XTOPIC_POST_DETAIL]: 'xtopic/post/detail',
  [AilabServerApiName.XTOPIC_REPLY_LIST]: 'xtopic/reply/list',
  [AilabServerApiName.XTOPIC_TOP_TAG_LIST]: 'xtopic/top_tag/list',
  [AilabServerApiName.XTOPIC_LIKE_ADD]: 'xtopic/like/add',
  [AilabServerApiName.XTOPIC_CAROUSEL_LIST]: 'xtopic/carousel/list',
  [AilabServerApiName.XTOPIC_TOP_CONTENT_LIST]: 'xtopic/top_content/list',
  [AilabServerApiName.XTOPIC_REPORT_INSERT]: 'xtopic/report/insert',
  [AilabServerApiName.XTOPIC_REPLY_INSERT]: 'xtopic/reply/insert',
  [AilabServerApiName.XTOPIC_USER_DETAIL]: 'xtopic/user/detail',
  [AilabServerApiName.XTOPIC_USER_UPDATE]: 'xtopic/user/update',
  [AilabServerApiName.XTOPIC_POST_SUGGEST_LIST]: 'xtopic/post/suggest_list',
  [AilabServerApiName.XTOPIC_POST_DELETE]: 'xtopic/post/delete',
  [AilabServerApiName.XTOPIC_REPLY_DELETE]: 'xtopic/reply/delete',
  [AilabServerApiName.XTOPIC_NOTIFICATION_LIST]: 'xtopic/notification/list',
  [AilabServerApiName.XTOPIC_NOTIFICATION_INSERT]: 'xtopic/notification/insert',
  [AilabServerApiName.XTOPIC_NOTIFICATION_DELETE]: 'xtopic/notification/delete',
  [AilabServerApiName.XTOPIC_NOTIFICATION_UNREAD]: 'xtopic/notification/unread',
  [AilabServerApiName.TOML_PARSE]: 'tools/toml/parse',
  [AilabServerApiName.TOML_STRINGIFY]: 'tools/toml/stringify',
  [AilabServerApiName.YAML_PARSE]: 'tools/yaml/parse',
  [AilabServerApiName.YAML_STRINGIFY]: 'tools/yaml/stringify',
  [AilabServerApiName.XTOPIC_NOTIFICATION_SEND_MASS]: 'xtopic/notification/send_mass',
  [AilabServerApiName.XTOPIC_NOTIFICATION_MASS_SENDING_HISTORY]:
    'xtopic/notification/mass_sending_history',
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_INSERT]: 'xtopic/notification_trigger/insert',
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_LIST]: 'xtopic/notification_trigger/list',
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_UPDATE]: 'xtopic/notification_trigger/update',
  [AilabServerApiName.XTOPIC_NOTIFICATION_TRIGGER_SENDED]:
    'xtopic/notification_trigger/show_sended',
  [AilabServerApiName.XTOPIC_BLOG_QUERY_LIST]: 'xtopic/blog/query_list',
  [AilabServerApiName.XTOPIC_BLOG_SYNC]: 'xtopic/blog/sync',
  [AilabServerApiName.XTOPIC_MEILI_SEARCH_BASIC_SEARCH]: 'xtopic/meili_search/basic_search',
  [AilabServerApiName.XTOPIC_MEILI_SEARCH_AVAILABLE]: 'xtopic/meili_search/available',
  // 登录：
  [AilabServerApiName.LOGIN_CHECK_USER]: 'login/user/check_user',
}
