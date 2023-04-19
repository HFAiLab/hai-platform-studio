/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable  @typescript-eslint/ban-ts-comment */
import type StateMachine from 'javascript-state-machine'
import type * as SocketIO from 'socket.io-client'
import type { IOResponse, SubMeta } from '../schema/index'
import { FRONTIER_CONSTANTS, SubOP } from '../schema/index'
import type { Logger } from '../schema/logger'
import { DefaultLogger, LoggerContainer } from '../schema/logger'
import { IOSerdeKit } from '../tools/serde'
import { FRONTIER_VERSION } from '../version'
import { FatalError, IOStatus, STMGenerator } from './stm'
import type { IOCallbackRecord, StateOptions } from './stm'

export interface IOFrontierOptions {
  /**
   * 已经初始化好的 socket io 客户端
   */
  io: ReturnType<typeof SocketIO.io>
  serdeKit?: IOSerdeKit
  logger?: Logger
  preserveTimeout?: number
  fatalErrorCallback?: (errorType: FatalError) => void
  connectedCallback?: () => void
  disConnectCallback?: () => void
}

// 将 data 和 client 分离，方便 stm 访问数据，同时不需要真正暴露到调用者
export class STMData {
  ioCallbackMap: Map<string, IOCallbackRecord> = new Map() // 存储一个订阅的 key 和它的函数列表

  // eslint-disable-next-line @typescript-eslint/ban-types
  callbackIdKeyMap: Map<number, [string, any, Function]> = new Map() // 存储一次 sub 的信息

  preserved = false //

  public notConnectedTimerId: number | null = null

  public notConnectedTimeout = 10000 // 多久没连上就触发严重错误
}

export class IOFrontierClient {
  private _debug_flag = false

  private io: SocketIO.Socket

  private logger: Logger

  private callbackId = 1

  // @ts-ignore
  private token = ''

  private serdeKit: IOSerdeKit

  private additionalParams: Record<string, unknown> = {}

  public preserveAllSubTimerId: number | null = null

  private preserveTimeout = 5000

  private queryResponseCache: Map<string, any> = new Map()

  public fatalErrorCallback: ((errorType: FatalError) => void) | null = null

  // @ts-ignore
  public connectedCallback: (() => void) | null = null

  public disConnectCallback: (() => void) | null = null

  // hint: 这里不能不加类型提示，否则会有一个报错，详见 TS4029
  protected stm: StateMachine & StateOptions
  // private fatalErrorResumeCallback:(() => void) | null = null;

  public constructor(options: IOFrontierOptions) {
    console.info('[frontier] start')
    // @ts-ignore
    window.__frontier_v2 = this
    this.logger = options.logger ?? new LoggerContainer(new DefaultLogger())
    this.serdeKit = options.serdeKit ?? new IOSerdeKit()
    this.preserveTimeout = options.preserveTimeout ?? this.preserveTimeout
    this.io = options.io
    this.fatalErrorCallback = options.fatalErrorCallback || this.fatalErrorCallback
    this.connectedCallback = options.connectedCallback || this.connectedCallback
    this.disConnectCallback = options.disConnectCallback || this.disConnectCallback

    this.stm = new STMGenerator({
      agency: this,
      stmData: new STMData(),
      logger: this.logger,
    })

    this.io.on('disconnect', () => {
      this.stm.autoGoto!(IOStatus.disconnect)
    })

    this.io.on(FRONTIER_CONSTANTS.FrontierVersion, (version: string) => {
      this.logger.info('frontier get version ', version)
      if (version !== FRONTIER_VERSION) {
        this.fatalErrorEmit(FatalError.versionNotMatch)
      }
    })

    if (this.io.connected) {
      this.stm.autoGoto!(IOStatus.connected)
    }

    // hint: 即使目前已经 connected 了，也需要 on connection，这样做的原因是后面可能 disconnect 之后再 connect
    this.io.on('connection', () => {
      this.stm.autoGoto!(IOStatus.connected)
    })

    this.io.on('connect_error', (err) => {
      /**
       * hint: 在我们滚动升级的时候，会出现 xhr poll error
       * 如果没有权限，会提示 Invalid Auth
       */
      this.logger.debug('io connect error', err instanceof Error) // true
      this.logger.debug('io connect error', err.message) // not authorized

      if (err.message === 'Invalid Auth') {
        this.fatalErrorEmit(FatalError.invalidAuth)
      }
    })

    document.addEventListener('visibilitychange', this.docVisibilityChange)
    this.logger.info('init io frontier client')
  }

  public setAdditionalParams(params: Record<string, unknown>) {
    this.additionalParams = params
  }

  public setToken(token: string) {
    this.token = token
  }

  public setLogger(logger: Logger) {
    this.logger = new LoggerContainer(logger)
  }

  public getIO(): SocketIO.Socket {
    return this.io
  }

  public isConnected() {
    return this.io.connected
  }

  public expire(command: string, query: any) {
    const callbackMapKey = `${this.serdeKit.ioSerde(command)}${
      this.serdeKit.spit
    }${this.serdeKit.ioSerde(query)}`

    const ioCallbackRecord = this.stm.stmData.ioCallbackMap.get(callbackMapKey)

    if (!ioCallbackRecord || !ioCallbackRecord.length) {
      return false
    }

    this.io!.emit(FRONTIER_CONSTANTS.FrontierForceRefresh, {
      command,
      query,
    })

    return true
  }

  public expireById(id: number) {
    const callbackInfo = this.stm.stmData.callbackIdKeyMap.get(id)
    if (!callbackInfo) {
      this.logger.warn(`expireById: ${id} not in callbackIdKeyMap`)
      return false
    }
    const [command, query] = callbackInfo
    return this.expire(command, query)
  }

  public sub<T>(
    command: string,
    meta: SubMeta<T>,
    callback: (payload: any, command: string, meta: SubMeta<T>) => any,
  ) {
    this.logger.info(
      `begin sub: ${command}, query`,
      Object.entries(meta.query as Record<string, unknown>).join('|'),
    )
    // hint: 因为现在我们目前允许在严重错误之后重连了，所以先暂时把这个关掉
    // if (this.stm.state === IOStatus.stopped) {
    //   this.logger.error('sub when stopped ')
    //   return -1
    // }

    // 补充必要的元素：
    meta.op = SubOP.sub

    meta.query = { ...meta.query, ...this.additionalParams }

    const callbackMapKey = this.getQueryId(command, meta.query)

    this.callbackId += 1
    const currentCallbackId = this.callbackId
    this.logger.info(`begin sub: ${command}, currentCallbackId: ${currentCallbackId}`)

    this.stm.stmData.callbackIdKeyMap.set(currentCallbackId, [
      command,
      { ...meta.query, ...this.additionalParams },
      callback,
    ])

    /**
     * hint: 这里目前的一个策略是，如果对于非首次 sub 的内容，会先返回上次 sub 的结果
     * 通常情况下，这个是没什么问题的，但是如果对于比如我们的 log 模块，本身是一个增量请求
     * 这里其实是有问题的，不过我们目前 log 窗口也没有办法多开，所以目前只是业务上规避了这个问题
     */
    if (this.stm.stmData.ioCallbackMap.has(callbackMapKey)) {
      const currentIoCallbackRecords = this.stm.stmData.ioCallbackMap.get(callbackMapKey)!
      currentIoCallbackRecords.push(callback)
      this.logger.info(`sub ${callbackMapKey} not first sub`)
      // hint: 如果是第二个 sub 的，不会立刻收到 payload, 需要补发
      if (this.queryResponseCache.has(callbackMapKey)) {
        callback(this.queryResponseCache.get(callbackMapKey)!, command, meta.query as any)
      }
      return currentCallbackId
    }

    this.stm.stmData.ioCallbackMap.set(callbackMapKey, [callback])

    if (this.stm.stmData.preserved || this.io.disconnected) {
      this.logger.warn(
        `sub ${command} when preserved: ${this.stm.stmData.preserved} or disconnected: ${this.io.disconnected}`,
      )
      return currentCallbackId
    }

    this.logger.info(`[emit] sub ${command}`)

    if (!this.io.hasListeners(command)) {
      this.io.on(command, (response: any) => {
        this.subCallback(command, response)
      })
    }

    this.io!.emit(command, meta)
    return currentCallbackId
  }

  public unsub(id: number) {
    const callbackInfo = this.stm.stmData.callbackIdKeyMap.get(id)
    if (!callbackInfo) {
      this.logger.warn(`unsub: ${id} not in callbackIdKeyMap`)
      return -1
    }

    const [command, query, callback] = callbackInfo

    const callbackMapKey = this.getQueryId(command, query)

    const ioCallbackRecord = this.stm.stmData.ioCallbackMap.get(callbackMapKey)
    if (!ioCallbackRecord) {
      this.logger.warn(`unsub: ${callbackMapKey} not in ioCallbackMap`)
      return -1
    }

    ioCallbackRecord.splice(ioCallbackRecord.indexOf(callback), 1)
    if (ioCallbackRecord.length === 0) {
      const op = SubOP.unsub
      this.stm.stmData.ioCallbackMap.delete(callbackMapKey)
      /**
       * 已经没有订阅了，应该及时清理 cache，否则会造成泄漏，特别是针对 log 这种内容比较多的
       */
      this.queryResponseCache.delete(callbackMapKey)
      this.logger.info(`[emit] unsub ${command}`, Object.entries(query).join('|'))
      this.io!.emit(command, {
        op,
        query,
      })
    }

    this.stm.stmData.callbackIdKeyMap.delete(id)
    return id
  }

  public clearAndStop() {
    if (this.io?.connected) {
      console.error('disconnect io first')
      return -1
    }
    this.stm.autoGoto!(IOStatus.stopped)
    return 0
  }

  public fatalErrorEmit(errorType: FatalError) {
    this.logger.info(`fatalErrorEmit, errorType: ${errorType}`)
    if (this.fatalErrorCallback) {
      this.fatalErrorCallback(errorType)
    }
  }

  private getQueryId(command: string, query: any) {
    return `${this.serdeKit.ioSerde(command)}${this.serdeKit.spit}${this.serdeKit.ioSerde(query)}`
  }

  /**
   * 当文档隐藏的时候，长链接应该取消所有的监听（长链本身可以选择是否断掉，暂时先不断掉吧）
   * 当文档展示的时候，恢复所有的监听
   */
  private docVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.logger.debug('[frontier] doc visibility change to visible')

      // 说明由不可见到可见的时间比较短，直接清理定时器即可
      if (this.preserveAllSubTimerId != null) {
        clearTimeout(this.preserveAllSubTimerId)
        return
      }

      if (this.stm.stmData.preserved && this.stm.state === IOStatus.connected) {
        this.resumeAllSub()
      }

      this.stm.stmData.preserved = false
    } else {
      this.logger.debug('[frontier] doc visibility change to hide')
      if (this.preserveAllSubTimerId !== null) {
        this.logger.warn('preserveAllSubTimerId should be null before when document hide')
        return
      }

      this.preserveAllSubTimerId = window.setTimeout(() => {
        this.preserveAllSub()
        this.preserveAllSubTimerId = null
        this.stm.stmData.preserved = true
      })
    }
  }

  public preserveAllSub() {
    if (this.stm.state !== IOStatus.connected) {
      return
    }
    this.logger.info(`preserve all sub, size: ${this.stm.stmData.callbackIdKeyMap.size}`)
    for (const [key] of this.stm.stmData.ioCallbackMap.entries()) {
      let [cmd, query] = key.split(this.serdeKit.spit)
      if (!cmd || !query) {
        this.logger.error(`[preserve error] cmd: ${cmd}, query: ${query}`)
        // eslint-disable-next-line no-continue
        continue
      }
      query = this.serdeKit.ioParse(query)
      this.logger.info('preserveAllSub', cmd, Object.entries(query || {}).join('|'))
      cmd = cmd.replace(/['"]/g, '')
      if (!this.io.disconnected) {
        this.io!.emit(cmd, {
          op: SubOP.unsub,
          query,
        })
      }
      if (this.io.hasListeners(cmd)) {
        this.io.removeAllListeners(cmd)
      }
    }
  }

  public resumeAllSub() {
    this.logger.info('resume all sub')
    for (const [key] of this.stm.stmData.ioCallbackMap.entries()) {
      let [cmd, query] = key.split(this.serdeKit.spit)
      if (!cmd || !query) {
        this.logger.error(`[resume error] cmd: ${cmd}, query: ${query}`)
        // eslint-disable-next-line no-continue
        continue
      }
      query = this.serdeKit.ioParse(query)
      this.logger.info('resumeAllSub and emit', cmd, Object.entries(query || {}).join('|'))
      cmd = cmd.replace(/['"]/g, '')
      this.io!.emit(cmd, {
        op: SubOP.sub,
        query,
      })
      if (!this.io.hasListeners(cmd)) {
        this.io.on(cmd, (response: any) => {
          this.subCallback(cmd!, response)
        })
      }
    }
  }

  private subCallback(command: string, response: IOResponse<any>) {
    if (this._debug_flag) {
      console.info(`[frontier][subCallback] command: ${command}, response:`, response)
    }
    const { query } = response.payload
    const callbackMapKey = this.getQueryId(command, query)

    const ioCallbackRecords = this.stm.stmData.ioCallbackMap.get(callbackMapKey)

    if (!ioCallbackRecords) {
      this.logger.info('subCallback ---> skip')
      return
    }

    for (const callback of ioCallbackRecords) {
      callback(response.payload, command, query)
    }

    this.queryResponseCache.set(callbackMapKey, response.payload)
  }
}
