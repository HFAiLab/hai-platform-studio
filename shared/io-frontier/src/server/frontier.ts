/* eslint-disable @typescript-eslint/no-non-null-assertion */
import stringifyInOrder from 'fst-stable-stringify'
import throttle from 'lodash/throttle'
import type { Server, Socket } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import type { SubMeta } from '../schema/index'
import { SubOP } from '../schema/index'
import type { Logger } from '../schema/logger'
import { DefaultLogger } from '../schema/logger'
import { IOServerSerdeKit } from '../tools/serde'
import { MemoryCacheManager } from './memoryCache'
import { RedisConn } from './redis'

export interface QueryIdInfo {
  content?: any
  socketIds: Set<string>
  intervalId: NodeJS.Timer
}

export const SUB_LISTEN_ALL_KEYS = 'SUB_LISTEN_ALL_KEYS'
export type CompareContentChange = (
  originContents: any,
  contents: any,
  keys: string[] | string,
  query?: any,
) => string[]

export enum MetricOP {
  sub = 'sub',
  unsub = 'unsub',
  intervalAdd = 'intervalAdd',
  intervalRemove = 'intervalRemove',
}
export type MetricReport = (roomId: string, command: string, op: MetricOP) => void

export type FrontierCacheType = 'redis' | 'memory'

export interface SerializeConfig {
  ignoreKeys: string[]
}

export interface ErrorExtraInfo {
  ioCommand: string
  queryId?: string
  skipIoEmitFatal?: boolean // 避免 io 向客户端抛出这个错误，这个背景是我们有一些 fatal 虽然是 fatal，但是是被捕获了的，这个暂时也不抛出来。
}
export interface IOFrontierServerOptions<Q> {
  serdeKit?: IOServerSerdeKit

  /**
   * ns: 命名空间，应用唯一
   */
  ns: string

  /**
   * 用于存储历史记录和 redis 分布式锁的地方
   */
  redisUrl: string

  /**
   * redis 数据库的 id，默认是 0 号数据库
   */
  redisDatabase?: number

  /**
   * 用于 socket.io 的订阅命令字
   */
  ioCommand: string

  /**
   * 获取数据的函数
   */
  requestData: <T extends IOFrontierServer<Q>>(query: Q, instance: T) => Promise<any>

  /**
   * 哪些 key 发生变化后通知变化
   * 默认会比较所有一级 key
   */
  subChangedKeys?: string | string[]

  /**
   * 调用查询的间隔（ms）
   * @default 3000
   */
  interval?: number

  /**
   * 日志实现
   * @default console
   */
  logger?: Logger

  /**
   * 用于生成各类 key 的类，拥有一个默认实现
   * 如果你想定制某些行为，例如在根据查询生成 queryId 的时候跳过某些属性，就可以使用
   * @default ServerSchemaGenerator
   */
  schemaGenerator?: ServerSchemaGenerator

  /**
   * 用于比较对象是否变化
   * @default compareContentChangeDefaultImpl
   */
  compareContentChange?: CompareContentChange

  /**
   * 用于 metric 数据上报，默认不传的话不上报
   * @default undefined
   */
  metricReport?: MetricReport

  /**
   * 过期灵敏度：当我们主动设置过期的时候，throttle 的时间间隔
   * @default 500
   */
  expireSenseTime?: number

  /**
   * 严重错误处理函数
   * @returns boolean 表示是否是值得断开客户端的错误
   */
  fatalErrorHandler?: (e: Error, extraInfo: ErrorExtraInfo) => boolean

  /**
   * 可以接受自定义的定时器函数
   */
  setInterval?: (callback: (args: void) => void, ms?: number) => NodeJS.Timer

  /**
   * 可以接受自定义的定时器取消函数
   */
  clearInterval?: (timerId: NodeJS.Timer) => void

  /**
   * 缓存上次节点的地方，memory 或者 redis，一般是 redis，不需要跨节点的一般用 memory
   */
  cacheType?: FrontierCacheType

  /**
   * queryId 删除之后的清理操作
   */
  queryIdDeletedCallback?: (queryId: string) => void
}

export class ServerSchemaGenerator {
  private nsImpl = () => ''

  public setNSImpl(fn: () => string) {
    this.nsImpl = fn
  }

  public getNS() {
    return this.nsImpl()
  }

  public genQueryId(command: string, query: any) {
    const ns = this.getNS()
    // hint: 不转 base64 的话由于 : 的存在层级太多了，会导致不太可能观测
    return `${ns}:${command}:${Buffer.from(stringifyInOrder(query)).toString('base64')}`
  }

  public genRedisDataId(queryId: string) {
    const ns = this.getNS()
    return `${ns}:ws:data:${queryId}`
  }

  public genRedisLockDataId(queryId: string) {
    const ns = this.getNS()
    return `${ns}:lock:ws:data:${queryId}`
  }
}

export function compareContentChangeDefaultImpl(
  originContents: any,
  contents: any,
  keys: string[] | string,
): string[] {
  // hint: 原则上，我们需要比较的内容都不应该为空
  if (!contents) {
    return []
  }
  if (!originContents && !contents) {
    return []
  }

  if (!originContents) {
    return typeof keys === 'string' ? [keys] : keys
  }

  const ifContentsArray = contents instanceof Array
  const ifOriginContentsArray = originContents instanceof Array
  const changeKeys = new Set()

  // changeKeys.add('demo')
  if (ifContentsArray !== ifOriginContentsArray) {
    throw new Error('[judgeChanged] content not match')
  }

  const cContents = ifContentsArray ? contents : [contents]
  const pContents = ifOriginContentsArray ? originContents : [originContents]

  if (keys === SUB_LISTEN_ALL_KEYS) {
    // eslint-disable-next-line no-param-reassign
    keys = Object.keys(cContents[0])
  }

  function getValueByKeyChain(content: any, key: string) {
    if (!content) return null
    const sKeys = key.split('.')
    let current = content
    for (const sKey of sKeys) {
      if (!current[sKey]) {
        return current[sKey]
      }
      current = current[sKey]
    }
    return current
  }

  function compareValueEqual(a: any, b: any) {
    // 两个都是 array
    if (a instanceof Array && b instanceof Array) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false
      }
      return true
    }
    // 其他情况
    return a === b
  }

  // more efficient than c_contents
  for (let i = 0; i < cContents.length; i += 1) {
    const cContent = cContents[i]
    const pContent = pContents[i]
    for (const key of keys) {
      if (
        !compareValueEqual(getValueByKeyChain(cContent, key), getValueByKeyChain(pContent, key))
      ) {
        changeKeys.add(key)
      }
    }
  }
  return [...changeKeys] as string[]
}

export class IOFrontierServer<Q> {
  io?: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

  // 维护 socketId 和它订阅的 queryId 的 Map
  socketIdQueryIdsMap = new Map<string, Set<string>>()

  // 维护一个 query 有哪些 socketId
  queryIdInfoMap = new Map<string, QueryIdInfo>()

  // 这里需要序列化的 string 有两个目的：1 是防止引用被改变导致缓存失效，2 是和 redis 的接口对齐
  protected memCache = new MemoryCacheManager<string, string>()

  redisConn: RedisConn

  cacheType: FrontierCacheType

  queryIdDeletedCallback?: (queryId: string) => void

  private serdeKit: IOServerSerdeKit

  protected _subInterval: number

  protected logger: Logger

  protected ns: string

  protected compareContentChange: CompareContentChange

  protected requestData: <T extends IOFrontierServer<Q>>(query: Q, instance: T) => Promise<any>

  protected subChangedKeys: string | string[]

  protected ioCommand: string

  protected metricReport?: MetricReport

  protected schemaGenerator: ServerSchemaGenerator

  protected fatalErrorHandler?: (e: Error, extraInfo: ErrorExtraInfo) => boolean

  protected setInterval: (callback: (args: void) => void, ms?: number) => NodeJS.Timer = setInterval

  protected clearInterval: (timerId: NodeJS.Timer) => void = clearInterval

  public expireData: (query: Q) => void

  // 更新锁
  updateLock = new Map<string, Date>()

  constructor(options: IOFrontierServerOptions<Q>) {
    this.ns = options.ns
    this.cacheType = options.cacheType ?? 'redis'
    this._subInterval = options?.interval ?? 3000 // 默认 3s
    this.logger = options?.logger ?? new DefaultLogger()
    this.serdeKit = options.serdeKit ?? new IOServerSerdeKit()
    this.redisConn = RedisConn.GetRedisConn(options.redisUrl, options.redisDatabase)
    this.schemaGenerator = options?.schemaGenerator ?? new ServerSchemaGenerator()
    this.schemaGenerator.setNSImpl(this.getNS)
    this.compareContentChange = options.compareContentChange ?? compareContentChangeDefaultImpl
    this.requestData = options.requestData
    this.subChangedKeys = options.subChangedKeys ?? SUB_LISTEN_ALL_KEYS
    this.ioCommand = options.ioCommand
    this.queryIdDeletedCallback = options.queryIdDeletedCallback
    if (options.metricReport) this.metricReport = options.metricReport
    this.expireData = throttle(this.expireDataImpl, options.expireSenseTime ?? 500)
    if (options.fatalErrorHandler) this.fatalErrorHandler = options.fatalErrorHandler

    if (options.setInterval) this.setInterval = options.setInterval
    if (options.clearInterval) this.clearInterval = options.clearInterval
  }

  get SUB_INTERVAL() {
    return this._subInterval
  }

  // 由于 Node.JS 的定时器不是特别准确，我们这里在设置过期时间后减去一点误差，这样可以让更新更加高效及时
  get EVENTLOOP_DEVIATION() {
    return 17
  }

  public getNS = () => {
    return this.ns
  }

  protected lockUpdate(queryId: string): boolean {
    if (this.updateLock.has(queryId)) {
      const date = this.updateLock.get(queryId)!
      if (Date.now() - date.valueOf() > 30 * 1000) {
        this.logger.error(`isUpdateLocked check error, more than ${30 * 1000}`, queryId)
      }
      return false
    }

    this.updateLock.set(queryId, new Date())
    return true
  }

  protected unlockUpdate(queryId: string) {
    this.updateLock.delete(queryId)
  }

  /**
   * 强制让某个数据刷新，当外部需要主动刷新的时候，会用到这里的函数
   */
  protected async expireDataImpl(query: Q) {
    const queryId = this.schemaGenerator.genQueryId(this.ioCommand, query)
    this.logger.info('expireDataImpl', queryId)
    const redisDataId = this.schemaGenerator.genRedisDataId(queryId)
    await this.deleteCache(redisDataId)
    await this.updateData(queryId, query)
  }

  /**
   * 给 socketId 增加一个 queryId
   * @date 2021-12-27
   * @param {any} socketId:string
   * @param {any} queryId:string
   * @returns {any}
   */
  protected addSocketIdQueryId(socketId: string, queryId: string) {
    if (!this.socketIdQueryIdsMap.has(socketId)) {
      this.socketIdQueryIdsMap.set(socketId, new Set([queryId]))
      return
    }

    const queryIdList = this.socketIdQueryIdsMap.get(socketId)
    queryIdList!.add(queryId)
    // FIXME: 可以把这个干掉
    this.socketIdQueryIdsMap.set(socketId, queryIdList!)
  }

  /**
   * 给 socketId 减少一个
   * @date 2021-12-27
   * @param {any} socketId:string
   * @param {any} queryId:string
   * @returns {any}
   */
  protected removeSocketIdQueryId(socketId: string, queryId: string) {
    if (!this.socketIdQueryIdsMap.has(socketId)) {
      return
    }
    const queryIdList = this.socketIdQueryIdsMap.get(socketId)!
    queryIdList.delete(queryId)
    if (queryIdList.size !== 0) {
      this.socketIdQueryIdsMap.set(socketId, queryIdList)
    } else {
      this.socketIdQueryIdsMap.delete(socketId)
    }
  }

  protected getKeyInRooms(key: any) {
    return this.queryIdInfoMap.has(key)
  }

  protected remoteDataConverter(data: any) {
    return data
  }

  protected deleteCache = async (dataId: string) => {
    if (this.cacheType === 'memory') {
      await this.memCache.delete(dataId)
      return
    }

    const redis = await this.redisConn.getClient()
    await redis.del(dataId)
  }

  protected getDataFromCache = async (dataId: string) => {
    if (this.cacheType === 'memory') {
      return this.memCache.get(dataId)
    }

    const redis = await this.redisConn.getClient()
    const data = await redis.get(dataId)
    return data
  }

  protected setDataToCache = async (
    dataId: string,
    value: string,
    timeout: number,
  ): Promise<void> => {
    if (this.cacheType === 'memory') {
      this.memCache.set(dataId, value, timeout)
      return
    }

    const redis = await this.redisConn.getClient()

    redis.set(dataId, value, {
      PX: timeout, // 以毫秒为单位设置过期时间，PX 是毫秒、EX 是秒
    })
  }

  /**
   * 取消某个 socket 的某个订阅，如果都取消了的话，就删除这个订阅查询
   * @date 2021-12-27
   * @param {any} queryId:string
   * @param {any} socketId:string
   * @returns {any}
   */
  protected remoteUnSubscribe(queryId: string, socketId: string) {
    const queryInfo = this.queryIdInfoMap.get(queryId)
    if (!queryInfo) {
      this.logger.warn(`remoteUnSubscribe ${queryId} but no queryInfo`)
      return
    }

    if (queryInfo.socketIds.has(socketId)) {
      this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.unsub)
    } else {
      this.logger.warn(
        `remoteUnSubscribe queryInfo socketIds does not has this socketId, queryId: ${queryId} socketId: ${socketId}`,
      )
    }

    queryInfo.socketIds.delete(socketId)
    this.logger.info(
      `after remoteUnSubscribe socketId: ${socketId} size:`,
      queryInfo.socketIds.size,
    )

    if (queryInfo.socketIds.size === 0) {
      this.logger.info(`clearInterval: ${queryInfo.intervalId} for ${queryId}`)
      this.clearInterval(queryInfo.intervalId)
      this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.intervalRemove)
      this.queryIdInfoMap.delete(queryId)
      const redisDataId = this.schemaGenerator.genRedisDataId(queryId)
      this.deleteCache(redisDataId)

      this.queryIdDeletedCallback?.(queryId)
    }
    this.removeSocketIdQueryId(socketId, queryId)
  }

  protected async getNextData(queryId: string, query: Q) {
    const redisDataId = this.schemaGenerator.genRedisDataId(queryId)
    const data = await this.getDataFromCache(redisDataId)
    // 设置过期时间即可，过期了，就说明不存在了
    // this.logger.info('[frontier] getNextData, len', data?.length);
    /**
     * 获取新数据的逻辑梳理
     * 1. 如果没有数据：查看是否能获取到锁：
     *       获取不到则说明在比较端的时间内，有别的 pod 在请求数据，这次就跳过了，下次再说
     *       获取到锁了，就设置数据，并且设置一个比较短的有效期
     * 2. 获取到数据了，直接返回即可
     */

    if (!data) {
      const lockSuccess = await this.redisConn.lock(
        this.schemaGenerator.genRedisLockDataId(queryId),
        this.SUB_INTERVAL / 1000,
      )
      if (!lockSuccess) {
        this.logger.warn(`getNextData hit lock unsuccess: ${queryId}`)
        return null
      }
      const nextData = await this.requestData(query, this)
      await this.setDataToCache(
        redisDataId,
        this.serdeKit.dataSerde(nextData),
        this.SUB_INTERVAL - this.EVENTLOOP_DEVIATION, // 以毫秒为单位设置过期时间
      )
      return nextData
    }
    // this.logger.info(`[frontier] not need get lock...`)
    return JSON.parse(data)
  }

  private async updateData(queryId: string, query: Q) {
    // 加锁成功的话，shouldUnlock 是 true，就需要解锁
    const successAndShouldUnlock = this.lockUpdate(queryId)
    try {
      if (!successAndShouldUnlock) {
        return
      }
      const intervalIdBeforeRequest = this.queryIdInfoMap.get(queryId)?.intervalId
      const data = (await this.getNextData(queryId, query)) as any
      const intervalIdAfterRequest = this.queryIdInfoMap.get(queryId)?.intervalId

      // 请求完数据，已经取消订阅并且重新订阅了，这个时候之前请求的数据不作数
      if (intervalIdBeforeRequest !== intervalIdAfterRequest) {
        return
      }

      if (!this.queryIdInfoMap.has(queryId)) return
      const changedKeys = this.compareContentChange(
        this.queryIdInfoMap.get(queryId)!.content,
        data,
        this.subChangedKeys,
        query,
      )
      if (changedKeys.length) {
        // this.logger.info(`${this.ioCommand} changed and begin emit`);
        const currentKeyInfo = this.queryIdInfoMap.get(queryId)!
        currentKeyInfo.content = data
        this.queryIdInfoMap.set(queryId, currentKeyInfo)
        this.io?.to(queryId).emit(this.ioCommand, {
          payload: {
            content: data,
            changedKeys,
            query,
          },
        })
      }
    } catch (e) {
      // hint: 这个函数循环调用，因此有概率出现问题，我们需要监控它
      this.logger.error(`${this.ioCommand} subscribe error`, e)
      if (this.fatalErrorHandler) {
        this.fatalErrorHandler(e as Error, {
          ioCommand: this.ioCommand,
          queryId,
        })
      }
    } finally {
      if (successAndShouldUnlock) {
        this.unlockUpdate(queryId)
      }
    }
  }

  protected async remoteSubscribe(
    queryId: string,
    query: Q,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) {
    this.logger.info(
      `[frontier] begin remoteSubscribe ${this.ioCommand}, query:`,
      JSON.stringify(query),
    )
    const socketId = socket.id
    const intervalId = this.setInterval(async () => {
      await this.updateData(queryId, query)
    }, this.SUB_INTERVAL)
    this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.intervalAdd)

    this.queryIdInfoMap.set(queryId, {
      content: null,
      socketIds: new Set([socketId]),
      intervalId,
    })

    // 以下异步：
    const redisDataId = this.schemaGenerator.genRedisDataId(queryId)
    // requestData 有可能会失败
    let data
    try {
      data = await this.requestData(query, this)
    } catch (e) {
      this.logger.error('first requestData error:', e)
      data = null
    }

    this.setDataToCache(
      redisDataId,
      this.serdeKit.dataSerde(data),
      this.SUB_INTERVAL - this.EVENTLOOP_DEVIATION, // 以毫秒为单位设置过期时间
    )

    this.logger.info('[frontier] begin emit', this.ioCommand)
    this.io?.to(queryId).emit(this.ioCommand, {
      payload: {
        content: data,
        changedKeys: [],
        query,
      },
    })

    // hint: 因为这个过程是异步，有可能这个执行的时候，已经调用了 unsub 了。
    if (!this.queryIdInfoMap.has(queryId)) {
      this.logger.warn(
        `[frontier] already delete queryInfo during requestData. queryId: ${queryId}`,
      )
      this.deleteCache(redisDataId) // hint: 这里直接删除应该是没有副作用的，顶多可能会多请求一次
      return
    }

    const queryIdInfo = this.queryIdInfoMap.get(queryId)!
    queryIdInfo.content = data
    this.queryIdInfoMap.set(queryId, queryIdInfo)
  }

  public register(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) {
    this.logger.info(`[frontier] register, command: ${this.ioCommand}, socketId: ${socket.id}`)
    this.io = io

    socket.on(this.ioCommand, (meta: SubMeta<Q>) => {
      const { query } = meta
      const queryId = this.schemaGenerator.genQueryId(this.ioCommand, query)

      if (meta.op === SubOP.sub) {
        this.logger.info(`[frontier] sub ${socket.id} query: ${queryId}`)
        this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.sub)
        socket.join(queryId)
        // let allSockets = await io.in(queryId).allSockets();
        // console.log(`all socket in queryId ${queryId}:`, allSockets.size, allSockets)
        if (this.getKeyInRooms(queryId)) {
          const keyInfo = this.queryIdInfoMap.get(queryId)!
          keyInfo.content &&
            socket.emit(this.ioCommand, {
              payload: {
                content: keyInfo.content,
                query,
                changedKeys: [],
              },
            }) // 如果暂时没有的话，等第一次生成的时候会广播一次
          keyInfo.socketIds.add(socket.id)
          this.queryIdInfoMap.set(queryId, keyInfo)
          // 不需要重新订阅，但是需要设置 socketId 和 queryId 的对应关系
          this.addSocketIdQueryId(socket.id, queryId)
          return
        }
        this.addSocketIdQueryId(socket.id, queryId)
        this.remoteSubscribe(queryId, query, socket)
      } else {
        this.logger.info(`[frontier] unsub ${socket.id} query: ${queryId}`)
        if (meta.op === SubOP.unsub) {
          socket.leave(queryId)
          this.remoteUnSubscribe(queryId, socket.id)
        }
      }
    })

    socket.on('disconnect', () => {
      this.logger.info(`[frontier] disconnect ${socket.id} for ${this.ioCommand}`)
      const queryIds = this.socketIdQueryIdsMap.get(socket.id)
      if (!queryIds) {
        this.logger.info(`[frontier] no ${socket.id} after disconnect`)
        return
      }
      for (const queryId of queryIds) {
        this.remoteUnSubscribe(queryId, socket.id)
      }
    })
  }
}
