import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'

export interface MemoryCacheOptions {
  expireTime: number
}

export interface MemoryCacheData<V> {
  data: V
  addTime: number
}

export class MemoryCacheManager<K, V> {
  expireTime = ONEHOUR

  dataMap = new Map<K, MemoryCacheData<V>>()

  constructor(options: MemoryCacheOptions) {
    this.expireTime = options.expireTime
  }

  get(key: K): V | null {
    const content = this.dataMap.get(key)
    if (!content) return null

    if (this.expireTime < getUTC8TimeStamp() - content.addTime) {
      this.dataMap.delete(key)
      return null
    }

    return content.data
  }

  set(key: K, data: V): void {
    this.dataMap.set(key, {
      addTime: getUTC8TimeStamp(),
      data,
    })
  }
}

export interface MemoryRedisCacheOptions<K, V> {
  checkInterval: number
  forceCacheTime: number
  redisChecker: (key: K, data: MemoryRedisCacheData<V>) => Promise<boolean>
}

export interface MemoryRedisCacheData<V> {
  data: V
  lastCheckTime: number
  addTime: number
}

/**
 * 在 redis 中检查数据是否过期，并且把数据放入内存中，之后可能是和集群对接的一种通用情况
 * 这里没有把数据直接放入 redis 中，减少对 redis 的请求和依赖
 * 但是外部在拿到数据过期之后的请求逻辑上，可以判断一下 redis 里面是否有更新的数据
 */
export class MemoryRedisCacheManager<K, V> {
  // 多久去 redis 中检查一次，默认十秒
  checkInterval = 10 * 1000

  // 强制缓存时间，12 小时，这个只是极特殊情况的兜底
  forceCacheTime = 12 * ONEHOUR

  redisChecker: (key: K, data: MemoryRedisCacheData<V>) => Promise<boolean>

  dataMap = new Map<K, MemoryRedisCacheData<V>>()

  constructor(options: MemoryRedisCacheOptions<K, V>) {
    this.checkInterval = options.checkInterval
    this.redisChecker = options.redisChecker
  }

  async get(key: K): Promise<V | null> {
    const content = this.dataMap.get(key)
    if (!content) return null

    const currentTimestamp = getUTC8TimeStamp() // 获取时间戳的逻辑要写到 await 的前面

    // lastCheckTime 可能比较旧，不判断了
    // if (currentTimestamp - content.lastCheckTime > this.forceCacheTime) {
    //   this.dataMap.delete(key)
    //   return null
    // }

    if (currentTimestamp - content.lastCheckTime >= this.checkInterval) {
      const valid = await this.redisChecker(key, content)
      if (!valid) {
        this.dataMap.delete(key)
        return null
      }
      content.lastCheckTime = currentTimestamp
    }

    return content.data
  }

  set(key: K, data: V, updateTime: number): void {
    this.dataMap.set(key, {
      addTime: updateTime,
      lastCheckTime: updateTime,
      data,
    })
  }
}
