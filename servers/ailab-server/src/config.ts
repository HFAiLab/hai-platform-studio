/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import fs from 'fs'
import path from 'path'
import TOML from '@iarna/toml'
import deepMerge from 'deepmerge'
import { jsonc } from 'jsonc'

// 线上和 prepub 都是 prod
export function isProd() {
  return process.env.NODEJS_ENV === 'prod'
}

// 线上的 prepub 才是 prepub
export function isPrePub() {
  return process.env.PREPUB === 'is_true'
}

// 线上非 prepub 环境
export function isOnline() {
  return process.env.NODEJS_ENV === 'prod' && process.env.PREPUB === 'is_false'
}

// 本地测试环境，增加这样一个语义化的判断更方便使用
export function isLocalDebug() {
  return !isProd()
}

/**
 * 默认的超时时间，都是 10 秒
 */
export const DEFAULT_REQ_TIMEOUT = 10 * 1000

export const FRONTIER_NS = 'ailab-server'

const PROD_REDIS_DB = 2
const TEST_REDIS_DB = 1

let cacheDevConfig: null | Record<string, Record<string, string | number>> = null

// hint: 此方法 release 条件下可能因为不存在开发文件配置导致报错
function getDevConfig() {
  if (cacheDevConfig) return cacheDevConfig
  const devrcString = `${fs.readFileSync(path.join(__dirname, '../../../.devrc'))}`
  const devrcLocalPath = path.join(__dirname, '../../../.devrc.local')
  if (fs.existsSync(devrcLocalPath)) {
    const devrcLocalString = `${fs.readFileSync(devrcLocalPath)}`
    cacheDevConfig = deepMerge(jsonc.parse(devrcString), jsonc.parse(devrcLocalString))
    return cacheDevConfig
  }
  return jsonc.parse(devrcString)
}

export function tryGetConfigFromDevrc<T>(config_name: string, default_value: T): T {
  if (isProd()) return default_value
  try {
    // 这里有一个小优化，可以只去尝试读一次 devrc
    const devConfig = getDevConfig()
    return devConfig['ailab-server'][config_name]
  } catch (e) {
    console.info('tryGetConfigFromDevrc error, use default value for', config_name)
    return default_value
  }
}

export const CLUSTER_REDIS_KEYS = {
  // 旧的 user_last_activity 是秒级别的，不准确，以后别用了
  cluster_user_last_activity_in_ns: 'user_last_activity_in_ns', // 集群存储用户活跃信息的时间戳（纳秒级别的数据）
  all_user_info_last_update_time: 'all_user_info_last_update_time', // 集群所有用户信息最后的更新时间戳
  cluster_all_user_used_quota: 'bff:all_user_used_quota', // 全部用户已经用的 quota
  all_user_quota_last_update_time: 'all_user_quota_last_update_time', // 全部用户 quota 的最后更新时间戳
}

export const BFF_REDIS_KEYS = {
  socket_user_task_cache: 'socket_user_task_cache',
  socket_user_service_task_cache: 'socket_user_service_task_cache',
  bff_all_users: 'bff_all_users',
  exp_changes_last_change_time: 'exp_changes_last_change_time_v2', // 上次请求有哪些用户的实验数据变化了的时间戳 , 值是一个时间戳
  bff_agg_fetion_get_task_log: 'bff_agg_fetion_get_task_log',
  bff_agg_fetion_http_ref_count: 'bff_agg_fetion_http_ref_count',
}

/*
 * 全局同时单例 Promise 的名字汇总，防止冲突造成严重 bug
 */
export const GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES = {
  get_all_user_quota: 'get_all_user_quota', // 请求获取全部用户的 quota
  get_user_info_prefix: 'getUserInfo', // 获取单个用户信息，用于存 token 和 name 的映射
  get_all_users_from_remote: 'get_all_users_from_remote', // 获取所有用户信息
  socket_get_user_task: 'socket_get_user_task', // 长链接获取用户实验详情
  socket_get_user_service_tasks: 'socket_get_user_service_tasks', // 长链接获取用户实验列表
}

export interface PartialTomlConfig {
  scheduler?: {
    default_group?: string
    error_node_meta_group?: string
  }
  jupyter?: {
    shared_node_group_prefix?: string
  }
}

export enum GlobalConfigKey {
  // bff 通用请求使用这个 token
  BFF_ADMIN_TOKEN = 'BFF_ADMIN_TOKEN',
  // bff 端口
  STUDIO_PORT = 'STUDIO_PORT',
  // bff url
  BFF_URL = 'BFF_URL',
  // bff 的 websocket 服务 url
  WS_URL = 'WS_URL',
  // 集群后端 url
  CLUSTER_SERVER_URL = 'CLUSTER_SERVER_URL',
  // jupyter 默认的 url
  STUDIO_JUPYTER_URL = 'STUDIO_JUPYTER_URL',
  // 集群后端的 redis
  STUDIO_CLUSTER_REDIS = 'STUDIO_CLUSTER_REDIS',
  // 集群后端的 pgsql
  STUDIO_CLUSTER_PGSQL = 'STUDIO_CLUSTER_PGSQL',
  // studio bff 的 redis
  STUDIO_BFF_REDIS = 'STUDIO_BFF_REDIS',
  // meili-search 搜索服务的 url
  STUDIO_MEILI_SEARCH_URL = 'STUDIO_MEILI_SEARCH_URL',
  // meili-search 搜索服务的 key
  STUDIO_MEILI_SEARCH_KEY = 'STUDIO_MEILI_SEARCH_KEY',
  // countly 的 url
  STUDIO_COUNTLY_URL = 'STUDIO_COUNTLY_URL',
  // countly 的 key
  STUDIO_COUNTLY_API_KEY = 'STUDIO_COUNTLY_API_KEY',
  // 外部用户归档任务使用的 user_token
  STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN = 'STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN',
  // 调度的默认分组
  SCHEDULER_DEFAULT_GROUP = 'SCHEDULER_DEFAULT_GROUP',
  // 调度时手动禁用的分组
  SCHEDULER_ERROR_NODE_META_GROUP = 'SCHEDULER_ERROR_NODE_META_GROUP',
  // jupyter 共享机器分组的默认前缀，hai-platform 需要：
  JUPYTER_SHARED_NODE_GROUP_PREFIX = 'JUPYTER_SHARED_NODE_GROUP_PREFIX',
  // 是否开启 fetion 上报
  ENABLE_FETION_REPORT = 'ENABLE_FETION_REPORT',
  // 是否开启线上调试，开启后会多一些日志
  ENABLE_ONLINE_DEBUG = 'ENABLE_ONLINE_DEBUG',
  // 数据集模块依赖的 mongodb
  STUDIO_MONGODB = 'STUDIO_MONGODB',
  // 申请外部用户 VPN 的地址，hai-platform 可能无此功能，内部对接人 dk
  VPN_SERVER_URL = 'VPN_SERVER_URL',
  // 创建外部用户和用户组的地址，hai-platform 可能无此功能，内部对接人 qjj
  NEPTUNE_SERVER_URL = 'NEPTUNE_SERVER_URL',
  // 申请 MIG 的接口，hai-platform 可能无此功能，内部对接人 zwt
  MIG_SERVER_URL = 'MIG_SERVER_URL',
  // 广场模块 静态上传的地址
  STUDIO_XTOPIC_STATIC_ONLINE_PATH = 'STUDIO_XTOPIC_STATIC_ONLINE_PATH',
  // 广场模块 静态上传的 uri，建议独立的静态服务
  STUDIO_XTOPIC_STATIC_ONLINE_URI = 'STUDIO_XTOPIC_STATIC_ONLINE_URI',
  // 交互式命令行教程的根路径
  STUDIO_TERMINAL_DEMO_CWD = 'STUDIO_TERMINAL_DEMO_CWD',
  // 集群统计日报目录
  CLUSTER_USAGE_REPORT_DIR = 'CLUSTER_USAGE_REPORT_DIR',
  // 严重信息需要通知的人名或者组名
  STUDIO_ERROR_NOTICE_ASSIGN_NAME = 'STUDIO_ERROR_NOTICE_ASSIGN_NAME',
  // 关闭静态文件 SERVE 功能
  STUDIO_DISABLE_STATIC_SERVE = 'STUDIO_DISABLE_STATIC_SERVE',
}

export const getGlobalConfig = () => {
  /**
   * 获取全局的配置，优先级：
   *
   * 0. .devrc 中的
   * 1. 环境变量中的
   * 2. 部分 toml 中存在的
   */

  let tomlConfig: PartialTomlConfig = {}
  if (process.env.MARSV2_MANAGER_CONFIG_DIR) {
    console.info('MARSV2_MANAGER_CONFIG_DIR:', process.env.MARSV2_MANAGER_CONFIG_DIR)
    for (const fileName of ['core.toml', 'scheduler.toml', 'extension.toml', 'override.toml']) {
      const filePath = path.join(process.env.MARSV2_MANAGER_CONFIG_DIR, fileName)
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        tomlConfig = deepMerge(tomlConfig, TOML.parse(fileContent))
      }
    }
  }

  console.info('config after tomlConfig:', tomlConfig)

  const BFF_ADMIN_TOKEN = tryGetConfigFromDevrc(
    GlobalConfigKey.BFF_ADMIN_TOKEN.toLowerCase(),
    process.env[GlobalConfigKey.BFF_ADMIN_TOKEN],
  )
  const STUDIO_PORT = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_PORT.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_PORT],
  )
  const BFF_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.BFF_URL.toLowerCase(),
    process.env[GlobalConfigKey.BFF_URL],
  )
  const WS_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.WS_URL.toLowerCase(),
    process.env[GlobalConfigKey.WS_URL],
  )
  const STUDIO_JUPYTER_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_JUPYTER_URL.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_JUPYTER_URL],
  )
  const CLUSTER_SERVER_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.CLUSTER_SERVER_URL.toLowerCase(),
    process.env[GlobalConfigKey.CLUSTER_SERVER_URL],
  )
  const STUDIO_CLUSTER_REDIS = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_CLUSTER_REDIS.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_CLUSTER_REDIS],
  )
  const STUDIO_CLUSTER_PGSQL = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_CLUSTER_PGSQL.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_CLUSTER_PGSQL],
  )
  /**
   * bff 自己用的 redis 的对应数据库的序号
   * redisDB: 0 给到之前的 handler.py; 1 是 bff 集群测试; 2 是 bff 集群线上; 3 以及以后目前可以作为测试
   * @date 2022-01-18
   * @returns {any}
   */
  const BFF_REDIS_DB = tryGetConfigFromDevrc(
    'bff_redis_db',
    isProd() ? PROD_REDIS_DB : TEST_REDIS_DB,
  )
  const STUDIO_BFF_REDIS = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_BFF_REDIS.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_BFF_REDIS],
  )
  const STUDIO_MEILI_SEARCH_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_MEILI_SEARCH_URL.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_MEILI_SEARCH_URL],
  )
  const STUDIO_MEILI_SEARCH_KEY = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_MEILI_SEARCH_KEY.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_MEILI_SEARCH_KEY],
  )
  const STUDIO_COUNTLY_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_COUNTLY_URL.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_COUNTLY_URL],
  )
  const STUDIO_COUNTLY_API_KEY = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_COUNTLY_API_KEY.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_COUNTLY_API_KEY],
  )
  // 任务归属于一个特定的打包用户 ext_user_archiver，查日志需要用此 token
  const STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN],
  )
  // for hai-platform
  const SCHEDULER_DEFAULT_GROUP =
    tomlConfig?.scheduler?.default_group ||
    tryGetConfigFromDevrc(
      GlobalConfigKey.SCHEDULER_DEFAULT_GROUP.toLowerCase(),
      process.env[GlobalConfigKey.SCHEDULER_DEFAULT_GROUP],
    )
  const SCHEDULER_ERROR_NODE_META_GROUP =
    tomlConfig?.scheduler?.error_node_meta_group ||
    tryGetConfigFromDevrc(
      GlobalConfigKey.SCHEDULER_ERROR_NODE_META_GROUP.toLowerCase(),
      process.env[GlobalConfigKey.SCHEDULER_ERROR_NODE_META_GROUP],
    )
  const JUPYTER_SHARED_NODE_GROUP_PREFIX =
    tomlConfig?.jupyter?.shared_node_group_prefix ||
    tryGetConfigFromDevrc(
      GlobalConfigKey.JUPYTER_SHARED_NODE_GROUP_PREFIX.toLowerCase(),
      process.env[GlobalConfigKey.JUPYTER_SHARED_NODE_GROUP_PREFIX],
    )
  const ENABLE_FETION_REPORT = tryGetConfigFromDevrc(
    GlobalConfigKey.ENABLE_FETION_REPORT.toLowerCase(),
    process.env[GlobalConfigKey.ENABLE_FETION_REPORT] &&
      process.env[GlobalConfigKey.ENABLE_FETION_REPORT] !== 'false',
  )
  const ENABLE_ONLINE_DEBUG = tryGetConfigFromDevrc(
    GlobalConfigKey.ENABLE_ONLINE_DEBUG.toLowerCase(),
    process.env[GlobalConfigKey.ENABLE_ONLINE_DEBUG] &&
      process.env[GlobalConfigKey.ENABLE_ONLINE_DEBUG] !== 'false',
  )
  // 数据集页面需要用的 mongoDB 数据库
  const STUDIO_MONGODB = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_MONGODB.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_MONGODB],
  )
  const VPN_SERVER_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.VPN_SERVER_URL.toLowerCase(),
    process.env[GlobalConfigKey.VPN_SERVER_URL],
  )
  const NEPTUNE_SERVER_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.NEPTUNE_SERVER_URL.toLowerCase(),
    process.env[GlobalConfigKey.NEPTUNE_SERVER_URL],
  )
  const MIG_SERVER_URL = tryGetConfigFromDevrc(
    GlobalConfigKey.MIG_SERVER_URL.toLowerCase(),
    process.env[GlobalConfigKey.MIG_SERVER_URL],
  )
  const STUDIO_XTOPIC_STATIC_ONLINE_PATH = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_XTOPIC_STATIC_ONLINE_PATH.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_XTOPIC_STATIC_ONLINE_PATH],
  )
  const STUDIO_XTOPIC_STATIC_ONLINE_URI = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_XTOPIC_STATIC_ONLINE_URI.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_XTOPIC_STATIC_ONLINE_URI],
  )
  const STUDIO_TERMINAL_DEMO_CWD = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_TERMINAL_DEMO_CWD.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_TERMINAL_DEMO_CWD],
  )
  const CLUSTER_USAGE_REPORT_DIR = tryGetConfigFromDevrc(
    GlobalConfigKey.CLUSTER_USAGE_REPORT_DIR.toLowerCase(),
    process.env[GlobalConfigKey.CLUSTER_USAGE_REPORT_DIR],
  )
  const STUDIO_ERROR_NOTICE_ASSIGN_NAME = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_ERROR_NOTICE_ASSIGN_NAME.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_ERROR_NOTICE_ASSIGN_NAME],
  )
  const STUDIO_DISABLE_STATIC_SERVE = tryGetConfigFromDevrc(
    GlobalConfigKey.STUDIO_DISABLE_STATIC_SERVE.toLowerCase(),
    process.env[GlobalConfigKey.STUDIO_DISABLE_STATIC_SERVE],
  )

  const globalConfig = {
    BFF_ADMIN_TOKEN: BFF_ADMIN_TOKEN as string,
    STUDIO_PORT: STUDIO_PORT as string,
    BFF_URL,
    WS_URL,
    STUDIO_JUPYTER_URL,
    CLUSTER_SERVER_URL,
    STUDIO_CLUSTER_REDIS: STUDIO_CLUSTER_REDIS as string,
    STUDIO_CLUSTER_PGSQL: STUDIO_CLUSTER_PGSQL as string,
    STUDIO_BFF_REDIS: STUDIO_BFF_REDIS as string,
    BFF_REDIS_DB,
    STUDIO_MEILI_SEARCH_URL,
    STUDIO_MEILI_SEARCH_KEY,
    STUDIO_COUNTLY_URL,
    STUDIO_COUNTLY_API_KEY,
    STUDIO_ARCHIVE_EXTERNAL_USER_TOKEN,
    SCHEDULER_DEFAULT_GROUP,
    SCHEDULER_ERROR_NODE_META_GROUP,
    JUPYTER_SHARED_NODE_GROUP_PREFIX,
    ENABLE_FETION_REPORT,
    ENABLE_ONLINE_DEBUG,
    STUDIO_MONGODB,
    VPN_SERVER_URL,
    NEPTUNE_SERVER_URL,
    MIG_SERVER_URL,
    STUDIO_XTOPIC_STATIC_ONLINE_PATH,
    STUDIO_XTOPIC_STATIC_ONLINE_URI,
    STUDIO_TERMINAL_DEMO_CWD,
    CLUSTER_USAGE_REPORT_DIR,
    STUDIO_ERROR_NOTICE_ASSIGN_NAME,
    STUDIO_DISABLE_STATIC_SERVE,
  }

  if (
    !process.env.TEST_MODE &&
    (!BFF_ADMIN_TOKEN ||
      !STUDIO_CLUSTER_REDIS ||
      !STUDIO_PORT ||
      !STUDIO_CLUSTER_PGSQL ||
      !STUDIO_BFF_REDIS)
  ) {
    for (const key of [
      'BFF_ADMIN_TOKEN',
      'STUDIO_CLUSTER_REDIS',
      'STUDIO_PORT',
      'STUDIO_CLUSTER_PGSQL',
      'STUDIO_BFF_REDIS',
    ]) {
      if (!globalConfig[key as keyof typeof globalConfig]) {
        throw new Error(`${key} 不能为空，请检查`)
      }
    }
  }

  return globalConfig
}

export const GlobalConfig = getGlobalConfig()
