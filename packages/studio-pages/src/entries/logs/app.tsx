import type { EmitterMethod } from 'event-emitter'
import React, { useReducer } from 'react'
import ReactDOM from 'react-dom'
import { QueryClientProvider } from 'react-query'
import type { AllFatalErrorsType } from '../../socket'
import { IOFrontier } from '../../socket'
import { BaseApp } from '../base/app'
import type { BaseContainerAPI } from '../base/container'
import { CountlyEventKey } from '../base/schema/countly'
import type { LogContainerAPI } from './container'
import { queryClient } from './query'
import { initLogState, logReducer } from './reducer'
import type { ILogDispatch, ILogState } from './reducer'
import { LogServiceNames } from './schema'
import type { EventParams, EventsKeys } from './schema/event'
import { LogContainer } from './widgets/log'

export const ServiceContext = React.createContext<{
  state: ILogState
  dispatch: <T extends keyof ILogState>(arg: ILogDispatch<T>) => void
  app: LogApp
  // @ts-expect-error ignore null
}>(null)

const LogEntrance = (props: { app: LogApp }) => {
  const [state, dispatch] = useReducer(
    logReducer,
    initLogState({
      theme: props.app.api().invokeService(LogServiceNames.getTheme, null),
      chain: props.app.api().invokeService(LogServiceNames.getCurrentLogChain, null),
      rank: props.app.api().invokeService(LogServiceNames.getCurrentLogRank, null),
      service: props.app.api().invokeService(LogServiceNames.getCurrentLogService, null),
    }),
  )

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ServiceContext.Provider value={{ state, dispatch, app: props.app }}>
      <QueryClientProvider client={queryClient}>
        <LogContainer />
      </QueryClientProvider>
    </ServiceContext.Provider>
  )
}

export class LogApp extends BaseApp<LogContainerAPI & BaseContainerAPI> {
  reqType: 'http' | 'io'

  userPreferredReqType: 'http' | 'io' | null

  started: boolean

  constructor(container_api: LogContainerAPI & BaseContainerAPI) {
    super(container_api)
    this.reqType = 'io'
    this.userPreferredReqType = null
    this.started = false
  }

  emit<T extends EventsKeys>(type: T, args: EventParams[T]) {
    super._emit(type as string, args)
  }

  on<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any) {
    super._on(type, fn as unknown as EmitterMethod)
  }

  off<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any) {
    super._off(type, fn as unknown as EmitterMethod)
  }

  once<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any) {
    super._once(type, fn as unknown as EmitterMethod)
  }

  start = () => {
    this.prepare()
    const token = this.api().getToken()
    IOFrontier.lazyInit(token)
    IOFrontier.getInstance().setLogger(this.api().getLogger())
    this.started = true
    this.render()
    // hint: 这个 callback 如果放在前面，可能还没有 start 和 render 就来了 callback，导致出现一些问题
    IOFrontier.addFatalErrorCallback(this.ioFatalErrorCallback)
    IOFrontier.addConnectedCallback(this.connectedCallback)
    IOFrontier.addDisConnectCallback(this.disConnectedCallback)
  }

  render() {
    ReactDOM.render(
      <React.StrictMode>
        <LogEntrance app={this} />
      </React.StrictMode>,
      this.api().getContainer(),
    )
  }

  ioFatalErrorCallback = (error: AllFatalErrorsType) => {
    this.api().getLogger().info(`ioFatalErrorCallback: ${error}`)
    if (!this.started) return
    this.reqType = 'http'
    IOFrontier.getInstance().clearAndStop()
    this.render()
    this.api().countlyReportEvent(CountlyEventKey.IOFrontierFatalError, {
      segmentation: {
        errorType: error,
      },
    })
  }

  connectedCallback = () => {
    if (!this.started) return
    if (!this.userPreferredReqType || this.userPreferredReqType === 'io') {
      if (this.reqType === 'http') {
        // hint: 默认是 io，如果是 http 说明已经失败过了
        this.api().countlyReportEvent(CountlyEventKey.IOFrontierFatalError)
      }
      this.reqType = 'io'
    }
    this.render()
  }

  setReqType = (type: 'io' | 'http') => {
    this.reqType = type
    this.userPreferredReqType = type
    this.render()
  }

  disConnectedCallback = () => {}

  override stop = () => {
    IOFrontier.removeFatalErrorCallback(this.ioFatalErrorCallback)
    IOFrontier.removeConnectedCallback(this.connectedCallback)
    IOFrontier.removeDisConnectCallback(this.disConnectedCallback)
    const res = ReactDOM.unmountComponentAtNode(this.api().getContainer())
    this.api().getLogger().info(`LogApp stop res:${res}`)
  }
}
