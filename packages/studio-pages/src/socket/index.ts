import { FatalError, IOFrontierClient } from '@hai-platform/io-frontier/lib/esm/client/index'
import { getFallbackWSURL } from '@hai-platform/shared'
import { SocketFatalError } from '@hai-platform/studio-schemas/lib/esm/socket'
import { LevelLogger } from '@hai-platform/studio-toolkit'
import { throttle } from 'lodash-es'
import * as SocketIO from 'socket.io-client'

export { FatalError } from '@hai-platform/io-frontier/lib/esm/client/index'

let IOFrontierInstance: IOFrontierClient | null = null

export enum UserFatalError {
  httpsNotSupport = 'httpsNotSupport',
  fatalError = 'fatalError',
  // hint: 实际上用户主动关闭，并不是一种 FatalError，但是这里逻辑还是可以复用的
  userManuallyDisconnect = 'userManuallyDisconnect',
}

export const AllFatalErrors = { ...FatalError, ...UserFatalError }
export type AllFatalErrorsType = typeof AllFatalErrors

type FatalErrorCallback = (error: AllFatalErrorsType) => void
type ConnectedCallback = () => void
type DisConnectCallback = () => void
type ReportMetricsCallback = (metrics: ReportMetrics[]) => void

export enum IoStatus {
  connected = 'connected',
  // disconnected = 'disconnected', // hint: 出于可维护性，手动断开也归类为 fataled
  fataled = 'fataled',
  none = 'none',
}

export function getWSServer() {
  try {
    if ((window as any).getProductionWSSUrl) return (window as any).getProductionWSSUrl()
    return getFallbackWSURL()
  } catch (e) {
    LevelLogger.info('getProductionWSSUrl error, fallback', getFallbackWSURL())
    return getFallbackWSURL()
  }
}

export enum ReportMetrics {
  pageFrontierCallTryRecoverFromFatalError = 'pageFrontierCallTryRecoverFromFatalError',
  pageFrontierGetFatalError = 'pageFrontierGetFatalError',
  pageFrontierManuallyDisconnect = 'pageFrontierManuallyDisconnect',
  pageFrontierManuallyConnect = 'pageFrontierManuallyConnect',
}

export const FATAL_ERROR_RETRY_TIMEOUT = 1 * 60 * 1000

/**
 *
 * 外部只记录 fatalError 和 connect 状态
 * 内部记录更多的状态机，但是内部不关心它是怎么断掉的
 *
 * 手动恢复：
 * 直接 manuallyConnect()
 *
 * 手动断开：
 * 直接 manuallyDisconnect()
 */

class IOFrontierFactory {
  io: ReturnType<typeof SocketIO.io> | null = null

  fatalErrorCallbacks: Set<FatalErrorCallback> = new Set()

  connectedCallbacks: Set<ConnectedCallback> = new Set()

  disConnectCallbacks: Set<DisConnectCallback> = new Set()

  ioStatus: IoStatus = IoStatus.none

  connectingTip: HTMLDivElement | null = null

  lastFatalError: AllFatalErrorsType | null = null

  reportMetrics: ReportMetrics[] = []

  reportMetricsCallback: ReportMetricsCallback | null = null

  // 当长链接挂掉之后，通过一个定时器来定时尝试恢复
  manuallyRetryTimerId: number | null = null

  private additionalParams: Record<string, unknown> = {}

  public setAdditionalParams(params: Record<string, unknown>) {
    this.additionalParams = params
    if (IOFrontierInstance) {
      IOFrontierInstance.setAdditionalParams(params)
    }
  }

  lazyInit(token: string) {
    if (IOFrontierInstance) return true
    this.io = SocketIO.io(getWSServer(), {
      auth: {
        // token: 'mock'
        token,
        ...this.additionalParams,
      },
      // hint: https://socket.io/docs/v3/using-multiple-nodes/ 这里目前还是有点疑问的
      // withCredentials: true,
      transports: ['websocket'],
      // 如果无限重连，可能就会导致不断打日志最终卡死
      reconnectionAttempts: 100,
    })
    IOFrontierInstance = new IOFrontierClient({
      io: this.io,
      logger: LevelLogger,
      fatalErrorCallback: this.fatalErrorCallback as unknown as (errorType: FatalError) => void,
      connectedCallback: this.connectedCallback,
      disConnectCallback: this.disConnectCallback,
    })
    IOFrontierInstance.setToken(token)
    IOFrontierInstance.setAdditionalParams(this.additionalParams)

    // hint: SocketFatalError 是 bff 自己返回的，实际上是业务层的报错，和 io-frontier 框架层没有关系的
    this.io.on(SocketFatalError, this.remoteFatalErrorHandler)

    // hint: 如果连接再断连，对用户来说是有代价的，所以这里 throttle 一个比较长的时间
    this.tryRecoverFromFatalError = throttle(this.tryRecoverFromFatalError, 60 * 1000)
    this.setInternalRecoverLogic()
    return true
  }

  remoteFatalErrorHandler = () => {
    LevelLogger.info(`remoteFatalErrorHandler callback, current status: ${this.ioStatus}`)
    // hint: 以第一次收到 SocketFatalError 为准，因为 fatalError 之后通常会有很多各种报错
    if (this.ioStatus === IoStatus.fataled) return
    this.invokeReportMetrics(ReportMetrics.pageFrontierGetFatalError)

    this.lastFatalError = AllFatalErrors.fatalError as unknown as AllFatalErrorsType
    this.fatalErrorCallback(this.lastFatalError)
    this.io?.disconnect()

    if (this.manuallyRetryTimerId) clearTimeout(this.manuallyRetryTimerId)
    // hint: 这里不需要 setInterval，是因为如果再失败就还会继续报 FatalError
    this.manuallyRetryTimerId = window.setTimeout(() => {
      LevelLogger.info('tryRecoverFromFatalError')
      this.tryRecoverFromFatalError()
    }, FATAL_ERROR_RETRY_TIMEOUT)
  }

  // eslint-disable-next-line class-methods-use-this
  setInternalRecoverLogic = () => {
    window.addEventListener('focus', () => {
      this.tryRecoverFromFatalError()
    })
    document.addEventListener('visibilitychange', () => {
      this.tryRecoverFromFatalError()
    })
  }

  tryRecoverFromFatalError = () => {
    if (this.ioStatus !== IoStatus.fataled) return
    this.invokeReportMetrics(ReportMetrics.pageFrontierCallTryRecoverFromFatalError)
    if (
      this.lastFatalError ===
      (UserFatalError.userManuallyDisconnect as unknown as AllFatalErrorsType)
    )
      return
    this.manuallyConnect()
  }

  invokeReportMetrics = (metric: ReportMetrics) => {
    if (this.reportMetricsCallback) {
      this.reportMetricsCallback([metric])
    } else {
      this.reportMetrics.push(metric)
    }
  }

  // 手动断开
  manuallyDisconnect() {
    if (!this.io) return
    this.invokeReportMetrics(ReportMetrics.pageFrontierManuallyDisconnect)
    this.lastFatalError = AllFatalErrors.userManuallyDisconnect as unknown as AllFatalErrorsType
    this.fatalErrorCallback(this.lastFatalError)
    this.io.disconnect()
  }

  // 手动恢复
  manuallyConnect() {
    if (!this.io) return
    LevelLogger.info('manuallyConnect')
    this.invokeReportMetrics(ReportMetrics.pageFrontierManuallyConnect)
    this.io?.connect()
  }

  createConnectingTip() {
    if (this.connectingTip) return
    this.connectingTip = document.createElement('div')
    const content = document.createElement('p')
    this.connectingTip.classList.add('io-connecting-container')
    content.classList.add('io-connecting-content')
    content.innerHTML = '正在建立链接中...'
    this.connectingTip.appendChild(content)
    document.body.append(this.connectingTip)
  }

  fatalErrorCallback = (error: AllFatalErrorsType) => {
    if (this.ioStatus === IoStatus.fataled) return
    this.ioStatus = IoStatus.fataled
    this.lastFatalError = error
    for (const callback of this.fatalErrorCallbacks) {
      callback(error)
    }
  }

  connectedCallback = () => {
    this.ioStatus = IoStatus.connected
    for (const callback of this.connectedCallbacks) {
      callback()
    }
  }

  disConnectCallback = () => {
    if (this.ioStatus === IoStatus.fataled) return
    for (const callback of this.disConnectCallbacks) {
      callback()
    }
  }

  addFatalErrorCallback(callback: FatalErrorCallback) {
    if (this.ioStatus === IoStatus.fataled) callback(this.lastFatalError!)
    this.fatalErrorCallbacks.add(callback)
  }

  removeFatalErrorCallback(callback: FatalErrorCallback) {
    this.fatalErrorCallbacks.delete(callback)
  }

  addConnectedCallback(callback: ConnectedCallback) {
    if (this.ioStatus === IoStatus.connected) callback()
    this.connectedCallbacks.add(callback)
  }

  removeConnectedCallback(callback: ConnectedCallback) {
    this.connectedCallbacks.delete(callback)
  }

  addDisConnectCallback(callback: DisConnectCallback) {
    if (this.ioStatus === IoStatus.fataled) callback()
    this.disConnectCallbacks.add(callback)
  }

  removeDisConnectCallback(callback: DisConnectCallback) {
    this.disConnectCallbacks.delete(callback)
  }

  addReportMetricsCallback = (callback: ReportMetricsCallback) => {
    this.reportMetricsCallback = callback
    if (this.reportMetrics.length) {
      this.reportMetricsCallback(this.reportMetrics)
    }
    this.reportMetrics = []
  }

  removeReportMetricsCallback = () => {
    this.reportMetricsCallback = null
  }

  // eslint-disable-next-line class-methods-use-this
  getInstance(): IOFrontierClient {
    if (!IOFrontierInstance) throw new Error('IOFrontier: please call lazyInit before getInstance')
    return IOFrontierInstance
  }
}

export const IOFrontier = new IOFrontierFactory()
