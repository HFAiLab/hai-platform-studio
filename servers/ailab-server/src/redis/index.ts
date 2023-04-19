import { createClient } from 'redis'
import { logger } from '../base/logger'
import { GlobalConfig } from '../config'

let redisConn: RedisConn | null = null
export class RedisConn {
  redisClient: ReturnType<typeof createClient>

  connected = false

  connecting = false

  constructor(url: string, database = 0) {
    this.redisClient = createClient({
      url,
      database,
    })
    process.on('exit', () => {
      this.redisClient && this.redisClient.disconnect()
      console.info('disconnect redis when process exit..')
    })
  }

  public async getClient(): Promise<ReturnType<typeof createClient>> {
    if (this.connecting) {
      while (true) {
        if (this.connected) return this.redisClient
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((rs) => setTimeout(rs, 100))
      }
    }
    if (!this.connected) {
      this.connecting = true
      console.info('---> redisClient.connect')
      await this.redisClient.connect()
      this.connected = true
      this.connecting = false
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
    await client.SETNX(key, value)
    await client.expire(key, timeout)
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

logger.info(`bffRedisConn, REDIS_DB: ${GlobalConfig.BFF_REDIS_DB}`)

// 中间层自己的 redis，目前只读不写，0 号数据库
export const bffRedisConn = new RedisConn(GlobalConfig.STUDIO_BFF_REDIS, GlobalConfig.BFF_REDIS_DB)

export const clusterRedisConn = new RedisConn(GlobalConfig.STUDIO_CLUSTER_REDIS)
