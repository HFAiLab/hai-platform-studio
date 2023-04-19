import { bffRedisConn } from '../redis'
import { logger } from './logger'

export enum FrequencyConfigKeys {
  biz_terminal_hfai_python = 'biz_terminal_hfai_python',
  cluster_user_tasks_counter_consumer = 'cluster_user_tasks_counter_consumer',
  cluster_user_top_task_list_consumer = 'cluster_user_top_task_list_consumer',
  cluster_user_of_of_quota_consumer = 'cluster_user_of_of_quota_consumer',
  cluster_schedule_total_info_consumer = 'cluster_schedule_total_info_consumer',
  cluster_schedule_total_typed_info_consumer = 'cluster_schedule_total_typed_info_consumer',
}

export const FrequencyConfig = {
  [FrequencyConfigKeys.biz_terminal_hfai_python]: {
    timeout: 8000,
  },
  [FrequencyConfigKeys.cluster_user_tasks_counter_consumer]: {
    timeout: 1000,
  },
  [FrequencyConfigKeys.cluster_user_top_task_list_consumer]: {
    timeout: 1000,
  },
  [FrequencyConfigKeys.cluster_user_of_of_quota_consumer]: {
    timeout: 1000,
  },
  [FrequencyConfigKeys.cluster_schedule_total_info_consumer]: {
    timeout: 1000,
  },
  [FrequencyConfigKeys.cluster_schedule_total_typed_info_consumer]: {
    timeout: 1000,
  },
}

class FrequencyControl {
  keyMap: Map<string, number> = new Map()

  constructor() {
    for (const key in FrequencyConfig) {
      this.register(key, FrequencyConfig[key as keyof typeof FrequencyConfig].timeout)
    }
  }

  register(key: string, timeout: number) {
    this.keyMap.set(key, timeout)
  }
}
class MultiFrequencyControl extends FrequencyControl {
  // hit 表示命中限流
  hit = async (key: string): Promise<boolean> => {
    if (!this.keyMap.has(key)) {
      logger.warn(`FrequencyControl key not found: ${key}`)
      return false
    }

    const redis = await bffRedisConn.getClient()
    const value = await redis.get(`frequency_control:${key}`)
    const currentTimestamp = Date.now()
    const pass = !value || currentTimestamp - Number(value) > this.keyMap.get(key)!
    // pass: 通过了这段时间了，即没有命中

    if (pass) {
      redis.set(`frequency_control:${key}`, currentTimestamp)
    }

    return !pass
  }
}

class SingleFrequencyControl extends FrequencyControl {
  lastTimeMap: Map<string, number> = new Map()

  // hit 表示命中限流
  hit = (key: string): boolean => {
    if (!this.keyMap.has(key)) {
      logger.warn(`FrequencyControl key not found: ${key}`)
      return false
    }

    const value = this.lastTimeMap.get(`frequency_control:${key}`)
    const currentTimestamp = Date.now()
    const pass = !value || currentTimestamp - Number(value) > this.keyMap.get(key)!
    // pass: 通过了这段时间了，即没有命中

    if (pass) {
      this.lastTimeMap.set(`frequency_control:${key}`, currentTimestamp)
    }

    return !pass
  }
}

export const GlobalMultiFrequencyControl = new MultiFrequencyControl()
export const GlobalSingleFrequencyControl = new SingleFrequencyControl()
