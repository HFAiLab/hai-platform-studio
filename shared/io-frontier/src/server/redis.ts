import { createClient } from 'redis'

let redisConn: RedisConn | null = null
export class RedisConn {
  redisClient: ReturnType<typeof createClient>

  connected = false

  constructor(url: string, database = 0) {
    console.info('redis conn:', url, database)
    this.redisClient = createClient({
      url,
      database,
    })
    process.on('exit', () => {
      if (this.redisClient) {
        this.redisClient.disconnect()
      }
      console.info('disconnect redis when process exit..')
    })
  }

  public async getClient(): Promise<ReturnType<typeof createClient>> {
    if (!this.connected) {
      await this.redisClient.connect()
      this.connected = true
    }
    return this.redisClient
  }

  /**
   * 尝试获取一个 redis 锁，获取到返回 true，获取不到返回 false
   * @date 2021-12-27
   * @param {锁名称} key:string
   * @param {过期时间 (s)，默认持有 30 秒} timeout:number=30
   * @param {any} value:string="1"
   * @returns {any}
   */
  async lock(key: string, timeout = 30, value = '1') {
    const client = await this.getClient()
    const nxRes = await client.SETNX(key, value)
    if (!nxRes) return !!nxRes
    // hint: Attention: 测试发现，如果不是整数，会有问题
    // 这里减少一秒钟的作用是防止锁的时间太长，从而直接导致本 pod 也跳过一次更新了
    await client.expire(key, Math.max(Number((timeout - 1).toFixed(0)), 1))
    return true
  }

  async unlock(key: string) {
    const client = await this.getClient()
    return client.del(key)
  }

  static GetRedisConn(url?: string, database?: number) {
    if (redisConn) return redisConn
    if (!url) {
      throw new Error('url is needed when first set redis')
    }
    redisConn = new RedisConn(url, database)
    return redisConn
  }
}

// export const redisConn = new RedisConn();
