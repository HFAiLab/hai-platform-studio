export function getUTC8TimeStamp() {
  return new Date().getTime() + (Number(new Date().getTimezoneOffset() / 60) + 8) * 3600 * 1000
}

export interface MemoryCacheData<V> {
  data: V
  addTime: number
}

/**
 * 内存缓存管理
 * 模拟 redis 设置可过期的缓存数据
 */
export class MemoryCacheManager<K, V> {
  dataMap = new Map<K, MemoryCacheData<V>>()

  expireMap = new Map<K, number>()

  constructor() {
    // 每一个小时清理一下过期数据
    setInterval(this.checkDelete, 60 * 60 * 1000)
  }

  checkDelete = () => {
    for (const [key, expireTime] of this.expireMap.entries()) {
      const content = this.dataMap.get(key)
      if (!content) continue
      if (expireTime < getUTC8TimeStamp() - content.addTime) {
        this.dataMap.delete(key)
        this.expireMap.delete(key)
      }
    }
  }

  delete(key: K): void {
    this.dataMap.delete(key)
    this.expireMap.delete(key)
  }

  get(key: K): V | null {
    const content = this.dataMap.get(key)
    if (!content) return null
    const expireTime = this.expireMap.get(key)
    if (!expireTime) return null

    if (expireTime < getUTC8TimeStamp() - content.addTime) {
      this.dataMap.delete(key)
      this.expireMap.delete(key)
      return null
    }

    return content.data
  }

  // timeout 是毫秒
  set(key: K, data: V, timeout: number): void {
    const currentTime = getUTC8TimeStamp()
    this.dataMap.set(key, {
      addTime: currentTime,
      data,
    })
    this.expireMap.set(key, timeout)
  }
}
