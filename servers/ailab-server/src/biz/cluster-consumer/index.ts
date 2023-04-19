import type {
  RemoteTaskOutOfQuotaList,
  RemoteUserTopTaskListMap,
  SingleUserTopTaskInfo,
  TaskOutOfQuota,
  UserTaskOutOfQuotaMapGroup,
  UserTopTaskListMapGroup,
} from '@hai-platform/shared'
import { isCPUGroup, isGPUGroup } from '@hai-platform/shared'
import type { OverViewType } from '@hai-platform/studio-schemas'
import { QueueStatus } from '@hai-platform/studio-schemas/lib/cjs/isomorph/common/index'
import type {
  CurrentScheduleTotalInfo,
  CurrentScheduleTotalTypedInfo,
} from '@hai-platform/studio-schemas/lib/cjs/isomorph/schedule'
import { FrequencyConfigKeys, GlobalSingleFrequencyControl } from '../../base/frequencyControl'
import { logger } from '../../base/logger'
import { GlobalConfig } from '../../config'
import { FetalErrorTypes, serverMonitor } from '../../monitor'
import { clusterRedisConn } from '../../redis'

const BFF_REDIS_PREFIX = 'bff'

interface RemoteUserTaskSum {
  user_name: string
  queue_status: QueueStatus
  sum: number
  max_running_seconds: number
}

type RemoteUserTasks = RemoteUserTaskSum[]

export interface UserTask {
  sum: number
  max_running_seconds: number
}
export interface UserTaskMap {
  [QueueStatus.queued]?: UserTask
  [QueueStatus.finished]?: UserTask
  [QueueStatus.scheduled]?: UserTask
}

export interface UserTasksMap {
  [key: string]: UserTaskMap
}

let globalUserTasksCounterConsumer: UserTasksCounterConsumer | null = null
let globalUserTopTaskListConsumer: UserTopTaskListConsumer | null = null
let globalUserOutOfQuotaConsumer: UserOutOfQuotaConsumer | null = null
let globalCurrentScheduleTotalInfoConsumer: CurrentScheduleTotalInfoConsumer | null = null
let globalCurrentScheduleTotalTypedInfoConsumer: CurrentScheduleTotalTypedInfoConsumer | null = null

abstract class BasicClusterConsumer {
  abstract requestRemoteData(): Promise<unknown>
}

// 针对集群 bff subscriber 的消费者，每秒请求一次新数据
export class UserTasksCounterConsumer extends BasicClusterConsumer {
  userTasksMap: UserTasksMap = {}

  remoteRedisKey = `${BFF_REDIS_PREFIX}:user_self_tasks`

  requestRemoteData = async () => {
    const redis = await clusterRedisConn.getClient()
    const rawTasksStr = await redis.get(this.remoteRedisKey)

    if (!rawTasksStr) {
      logger.error(`bff consumer error: get ${this.remoteRedisKey} empty`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.clusterConsumerError,
        content: `${this.remoteRedisKey} empty`,
      })
      return
    }
    const tasks = JSON.parse(rawTasksStr) as RemoteUserTasks

    this.userTasksMap = {}

    for (const task of tasks) {
      if (!this.userTasksMap[task.user_name]) this.userTasksMap[task.user_name] = {}

      this.userTasksMap[task.user_name]![task.queue_status] = {
        sum: task.sum,
        max_running_seconds: task.max_running_seconds,
      }
    }
  }

  static getInstance() {
    if (!globalUserTasksCounterConsumer)
      globalUserTasksCounterConsumer = new UserTasksCounterConsumer()
    return globalUserTasksCounterConsumer
  }

  async getUserData(user_name: string, force = false): Promise<UserTaskMap | undefined> {
    if (
      !GlobalSingleFrequencyControl.hit(FrequencyConfigKeys.cluster_user_tasks_counter_consumer) ||
      force
    ) {
      logger.info('UserTasksCounterConsumer begin requestRemoteData')
      await this.requestRemoteData()
      logger.info('UserTasksCounterConsumer end requestRemoteData')
    }
    return this.userTasksMap[user_name]
  }
}

export class UserTopTaskListConsumer extends BasicClusterConsumer {
  userTasksMap: UserTopTaskListMapGroup = {}

  seq = 0

  remoteRedisKey = `${BFF_REDIS_PREFIX}:user_top_task_list_all`

  requestRemoteData = async (): Promise<null> => {
    const redis = await clusterRedisConn.getClient()
    logger.info('UserTopTaskListConsumer get redis')
    const rawTasksStr = await redis.get(this.remoteRedisKey)
    logger.info('UserTopTaskListConsumer get redis data')

    if (!rawTasksStr) {
      logger.error(`bff consumer error: get ${this.remoteRedisKey} empty`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.clusterConsumerError,
        content: `${this.remoteRedisKey} empty`,
      })
      return null
    }
    const tasksMap = JSON.parse(rawTasksStr) as RemoteUserTopTaskListMap
    // console.log('tasksMap:', tasksMap)
    this.userTasksMap = {}
    logger.info('UserTopTaskListConsumer get redis after json parse')

    for (const key in tasksMap) {
      if (key === 'seq') {
        this.seq = tasksMap[key]
        // eslint-disable-next-line no-continue
        continue
      }
      const typedKey = key as QueueStatus.queued | QueueStatus.scheduled
      const tasks = tasksMap[typedKey]!

      for (const user_name in tasks) {
        if (!this.userTasksMap[user_name]) this.userTasksMap[user_name] = {}
        this.userTasksMap[user_name]![typedKey] = tasks[user_name]
      }
    }

    return null
    // console.log('this.userTasksMap', this.userTasksMap)
  }

  static getInstance() {
    if (!globalUserTopTaskListConsumer)
      globalUserTopTaskListConsumer = new UserTopTaskListConsumer()
    return globalUserTopTaskListConsumer
  }

  async getUserData(user_name: string, force = false): Promise<SingleUserTopTaskInfo | undefined> {
    if (
      !GlobalSingleFrequencyControl.hit(FrequencyConfigKeys.cluster_user_top_task_list_consumer) ||
      force
    ) {
      logger.info('UserTopTaskListConsumer begin requestRemoteData')
      await this.requestRemoteData()
      logger.info('UserTopTaskListConsumer end requestRemoteData')
    }

    return {
      seq: this.seq,
      userTopTaskList: this.userTasksMap[user_name] || {},
    }
  }
}

export class UserOutOfQuotaConsumer extends BasicClusterConsumer {
  userTasksMap: UserTaskOutOfQuotaMapGroup = {}

  remoteRedisKey = `${BFF_REDIS_PREFIX}:quota_exceeded`

  requestRemoteData = async () => {
    const redis = await clusterRedisConn.getClient()
    const rawTasksStr = await redis.get(this.remoteRedisKey)
    if (!rawTasksStr) {
      logger.error(`bff consumer error: get ${this.remoteRedisKey} empty`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.clusterConsumerError,
        content: `${this.remoteRedisKey} empty`,
      })
      return
    }
    const tasks = JSON.parse(rawTasksStr) as RemoteTaskOutOfQuotaList
    this.userTasksMap = {}

    for (const task of tasks) {
      if (!this.userTasksMap[task.user_name]) this.userTasksMap[task.user_name] = []
      this.userTasksMap[task.user_name]!.push({
        id: task.id,
        nb_name: task.nb_name,
      })
    }
  }

  static getInstance() {
    if (!globalUserOutOfQuotaConsumer) globalUserOutOfQuotaConsumer = new UserOutOfQuotaConsumer()
    return globalUserOutOfQuotaConsumer
  }

  async getUserData(user_name: string): Promise<TaskOutOfQuota[] | undefined> {
    if (!GlobalSingleFrequencyControl.hit(FrequencyConfigKeys.cluster_user_of_of_quota_consumer)) {
      await this.requestRemoteData()
    }
    return this.userTasksMap[user_name]
  }
}

export class CurrentScheduleTotalInfoConsumer extends BasicClusterConsumer {
  totalInfo: CurrentScheduleTotalInfo | null = null

  remoteRedisKey = `${BFF_REDIS_PREFIX}:total_tasks`

  requestRemoteData = async () => {
    const redis = await clusterRedisConn.getClient()
    const rawTasksStr = await redis.get(this.remoteRedisKey)
    if (!rawTasksStr) {
      logger.error(`bff consumer error: get ${this.remoteRedisKey} empty`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.clusterConsumerError,
        content: `${this.remoteRedisKey} empty`,
      })
      return
    }
    const totalInfo = JSON.parse(rawTasksStr) as CurrentScheduleTotalInfo
    this.totalInfo = totalInfo
  }

  static getInstance() {
    if (!globalCurrentScheduleTotalInfoConsumer)
      globalCurrentScheduleTotalInfoConsumer = new CurrentScheduleTotalInfoConsumer()
    return globalCurrentScheduleTotalInfoConsumer
  }

  async getUserData(): Promise<CurrentScheduleTotalInfo | null> {
    if (
      !GlobalSingleFrequencyControl.hit(FrequencyConfigKeys.cluster_schedule_total_info_consumer)
    ) {
      await this.requestRemoteData()
    }
    return this.totalInfo
  }
}

export class CurrentScheduleTotalTypedInfoConsumer extends BasicClusterConsumer {
  totalInfo: CurrentScheduleTotalTypedInfo | null = null

  remoteRedisKey = `${BFF_REDIS_PREFIX}:total_typed_role_tasks`

  requestRemoteData = async () => {
    const redis = await clusterRedisConn.getClient()
    const rawTasksStr = await redis.get(this.remoteRedisKey)
    if (!rawTasksStr) {
      logger.error(`bff consumer error: get ${this.remoteRedisKey} empty`)
      serverMonitor.reportV2BFFTextError({
        keyword: FetalErrorTypes.clusterConsumerError,
        content: `${this.remoteRedisKey} empty`,
      })
      return
    }
    const totalInfo = JSON.parse(rawTasksStr) as CurrentScheduleTotalTypedInfo
    this.totalInfo = totalInfo
  }

  static getInstance() {
    if (!globalCurrentScheduleTotalTypedInfoConsumer)
      globalCurrentScheduleTotalTypedInfoConsumer = new CurrentScheduleTotalTypedInfoConsumer()
    return globalCurrentScheduleTotalTypedInfoConsumer
  }

  async getUserData(): Promise<CurrentScheduleTotalTypedInfo | null> {
    if (
      !GlobalSingleFrequencyControl.hit(
        FrequencyConfigKeys.cluster_schedule_total_typed_info_consumer,
      )
    ) {
      await this.requestRemoteData()
    }
    return this.totalInfo
  }
}

export async function getTaskTypedOverview(type?: OverViewType) {
  const typedInfoConsumer = CurrentScheduleTotalTypedInfoConsumer.getInstance()
  const data = (await typedInfoConsumer.getUserData()) || ({} as CurrentScheduleTotalTypedInfo)
  const useType = type || 'gpu'

  const computedKeys = Object.keys(data).filter((key) => {
    return (useType === 'cpu' ? isCPUGroup : isGPUGroup)(key)
  })

  const res: { [key: string]: CurrentScheduleTotalInfo } = {}
  for (const key of computedKeys) {
    const scheduleData = data[key] || []
    for (const scheduleUnit of scheduleData) {
      // eslint-disable-next-line no-prototype-builtins
      if (!res.hasOwnProperty(`${scheduleUnit.priority}`)) {
        res[`${scheduleUnit.priority}`] = {
          [QueueStatus.scheduled]: 0,
          [QueueStatus.queued]: 0,
        }
      }
      res[`${scheduleUnit.priority}`]![scheduleUnit.queue_status] += scheduleUnit.count
    }
  }

  return res
}

// 外部用户默认调度分组为 SCHEDULER_DEFAULT_GROUP 默认分组
const EXTERNAL_USER_SCHEDULABLE_GROUP = [GlobalConfig.SCHEDULER_DEFAULT_GROUP || '']
// 获取外部用户的排队情况
export async function getExternalTaskCount() {
  const typedInfoConsumer = CurrentScheduleTotalTypedInfoConsumer.getInstance()
  const data = (await typedInfoConsumer.getUserData()) || ({} as CurrentScheduleTotalTypedInfo)
  const ret = { queued: 0, scheduled: 0 }
  for (const group of EXTERNAL_USER_SCHEDULABLE_GROUP) {
    if (data[group]) {
      const scheduleData = data[group] || []
      for (const scheduleUnit of scheduleData) {
        if (scheduleUnit.user_role === 'external') {
          ret[scheduleUnit.queue_status] += scheduleUnit.count
        }
      }
    }
  }
  return ret
}
