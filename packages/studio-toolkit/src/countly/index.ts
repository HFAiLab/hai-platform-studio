// @ts-expect-error because is a js file
import Countly from '@hai-platform/countly-sdk-web'

const DefaultReqClearTime = 3000
export const DebugDeviceId = 'debug-device'

// ref: https://countly.github.io/countly-sdk-web/Countly.html#.init
export interface CountlyEvent {
  count?: number
  sum?: number
  dur?: number
  segmentation?: unknown // 这里不约束类型了，上报的地方直接写就行
}

export interface CountlyInitConfig {
  apiKey: string
  countlyURL: string
  pageName: string
  version: string
  stopCallback?: (stop: boolean) => any
  deviceId: string
  proxy_url?: string
  debug?: boolean
}

export class CountlyReport<T> {
  initConfig: CountlyInitConfig

  clearReqId = -1

  stopRecord = false

  constructor(initConfig: CountlyInitConfig) {
    this.initConfig = initConfig
    this.init()
  }

  setStopStatus(stop: boolean) {
    this.stopRecord = stop
    if (stop) {
      Countly.stop_track_errors()
    } else {
      this.beginAutoTrackErrors()
    }

    if (this.initConfig.stopCallback) {
      this.initConfig.stopCallback(stop)
    }
  }

  init() {
    Countly.init({
      // provide your app key that you retrieved from Countly dashboard
      app_key: this.initConfig.apiKey,
      // provide your server IP or name. Use try.count.ly for EE trial server.
      url: this.initConfig.countlyURL,
      // 一个 userName 实际上可能有多个 device
      device_id: this.initConfig.deviceId,
      // 不把未发送的信息写入 localStorage
      proxy_url: this.initConfig.proxy_url,

      queue_size: 20, // 最多缓存的请求（一个请求里面有多个 event），多余的会被丢弃掉，设置的过大可能会导致 localStorage 压力过大

      event_size: 20, // 最多未处理的 event
    })
    if (!this.initConfig.debug) {
      Countly.group_features({
        all: [
          'sessions',
          'events',
          'views',
          'scrolls',
          'clicks',
          'forms',
          'crashes',
          'attribution',
          'users',
        ],
      })
      Countly.track_sessions()
      Countly.track_pageview(this.initConfig.pageName)
      window.localStorage.setItem(`${this.initConfig.apiKey}/cly_queue`, '[]')
      this.beginAutoTrackErrors()
    }
    // 目前是把所有的功能都打开了，实际上后面也可以选择使用
    console.info('[Toolkit] Countly init success!')
  }

  beginAutoTrackErrors() {
    if (this.initConfig.deviceId !== DebugDeviceId) {
      Countly.track_errors({
        ext_version: this.initConfig.version,
        device_id: this.initConfig.deviceId,
      })
    }
  }

  addEvent(key: T, event?: CountlyEvent) {
    if (this.stopRecord) return

    if (!event) {
      // eslint-disable-next-line no-param-reassign
      event = {
        count: 1,
      }
    }

    const resultEvent = { key, ...event }

    if (!resultEvent.segmentation) resultEvent.segmentation = {}
    // @ts-expect-error because ignore type
    resultEvent.segmentation.device_id = this.initConfig.deviceId
    // @ts-expect-error because ignore type
    resultEvent.segmentation.ext_version = this.initConfig.version

    try {
      if (this.initConfig.deviceId === DebugDeviceId) {
        console.info(`[addEvent debug] key: ${key}, event:`, resultEvent)
        // return;
      }
    } catch (e) {
      // do nothing
      return
    }

    Countly.add_event(resultEvent)
    this.delayClearStorage()
  }

  // 上报自己主动 try catch 的错误
  logError(err: unknown) {
    if (this.stopRecord) return

    if (this.initConfig.deviceId === DebugDeviceId) {
      console.info('[logError debug] err:', err)
      return
    }

    Countly.log_error(err, {
      device_id: this.initConfig.deviceId,
      ext_version: this.initConfig.version,
    })
    this.delayClearStorage()
  }

  delayClearStorage() {
    clearTimeout(this.clearReqId)
    this.clearReqId = window.setTimeout(() => {
      window.localStorage.setItem(`${this.initConfig.apiKey}/cly_queue`, '[]')
      this.clearReqId = 0
    }, DefaultReqClearTime)
  }
}
