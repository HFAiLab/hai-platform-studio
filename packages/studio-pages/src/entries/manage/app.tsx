import type { EmitterMethod } from 'event-emitter'
import React, { useReducer } from 'react'
import ReactDOM from 'react-dom'
import { QueryClientProvider } from 'react-query'
import { useEffectOnce } from 'react-use'
import type { Chain } from '../../model/Chain'
import type { AllFatalErrorsType } from '../../socket/index'
import { IOFrontier } from '../../socket/index'
import { BaseApp } from '../base/app'
import type { BaseContainerAPI } from '../base/container'
import { CountlyEventKey } from '../base/schema/countly'
import type { ManagerContainerAPI } from './container'
import { queryClient } from './query'
import { ManagerServiceContext, getManagerReducer, initManagerState } from './reducer'
import type { IManagerDispatch, IManagerState } from './reducer'
import type { ExpsPageManageState } from './schema'
import { ExpsManageServiceNames } from './schema'
import type { EventParams } from './schema/event'
import { EventsKeys } from './schema/event'
import { HTTPTrainingsContainer, IOTrainingsContainer } from './widgets/trainings'

const ManageEntrance = (props: { app: ManageApp; reqType: 'http' | 'io' }) => {
  const isInitAutoShowLog = props.app
    .api()
    .invokeService(ExpsManageServiceNames.getAutoShowLog, null)

  const trainingsCustomColumns = props.app
    .api()
    .invokeService(ExpsManageServiceNames.getTrainingsColumns, null)

  const experimentsFilterMemorize = props.app
    .api()
    .invokeService(ExpsManageServiceNames.getExperimentsFilterMemorize, null)

  const defaultPageState = props.app
    .api()
    .invokeService(ExpsManageServiceNames.getDefaultManageState, null)

  const pageStateChangeCallback = (manageState: ExpsPageManageState) => {
    props.app.api().invokeService(ExpsManageServiceNames.setPageState, manageState)
  }

  const [state, reducerDispatch] = useReducer(
    getManagerReducer({ pageStateChangeCallback }),
    {
      autoShowLog: isInitAutoShowLog,
      experimentsFilterMemorize,
      trainingsCustomColumns,
      manageState: defaultPageState,
    },
    initManagerState,
  )

  function batchDispatch<T extends keyof IManagerState>(args: IManagerDispatch<T>[]) {
    for (const arg of args) {
      if (arg.type === 'autoShowLog') {
        props.app.api().invokeService(ExpsManageServiceNames.setAutoShowLog, Boolean(arg.value))
      }
      if (arg.type === 'experimentsFilterMemorize') {
        props.app
          .api()
          .invokeService(ExpsManageServiceNames.setExperimentsFilterMemorize, Boolean(arg.value))
      }
      if (arg.type === 'trainingsCustomColumns') {
        props.app
          .api()
          .invokeService(
            ExpsManageServiceNames.setTrainingsColumns,
            arg.value as IManagerState['trainingsCustomColumns'],
          )
      }
    }
    reducerDispatch(args)
  }

  function dispatch<T extends keyof IManagerState>(arg: IManagerDispatch<T>) {
    batchDispatch([arg])
  }

  useEffectOnce(() => {
    props.app.on(EventsKeys.AssignSelectChain, (chain) => {
      batchDispatch([
        { type: 'currentSelectedChain', value: chain },
        {
          type: 'manageState',
          value: {
            selectChainId: chain?.chain_id || null,
          },
        },
      ])
    })
  })

  return (
    <ManagerServiceContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{ state, dispatch, batchDispatch, app: props.app, reqType: props.reqType }}
    >
      <QueryClientProvider client={queryClient}>
        {props.reqType === 'http' && <HTTPTrainingsContainer />}
        {props.reqType === 'io' && <IOTrainingsContainer />}
      </QueryClientProvider>
    </ManagerServiceContext.Provider>
  )
}

export class ManageApp extends BaseApp<ManagerContainerAPI & BaseContainerAPI> {
  reqType: 'http' | 'io' = 'io'

  started = false

  constructor(container_api: ManagerContainerAPI & BaseContainerAPI) {
    super(container_api)
    this._currentChain = null
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

  override stop = () => {
    IOFrontier.removeFatalErrorCallback(this.ioFatalErrorCallback)
    IOFrontier.removeConnectedCallback(this.connectedCallback)
    IOFrontier.removeDisConnectCallback(this.disConnectedCallback)
    const res = ReactDOM.unmountComponentAtNode(this.api().getContainer())
    this.api().getLogger().info(`ManageApp stop res:${res}`)
    window._select_chain_sync_init = false
  }

  render() {
    ReactDOM.render(
      <React.StrictMode>
        <ManageEntrance app={this} reqType={this.reqType} />
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
    this.reqType = 'io'
    this.render()
  }

  disConnectedCallback = () => {}

  getCurrentChain = () => {
    return this._currentChain
  }

  setCurrentChain = (chain: Chain | null) => {
    this._currentChain = chain
    this.api().invokeService(ExpsManageServiceNames.setCurrentChain, chain)
  }

  _currentChain: Chain | null

  on<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any) {
    super._on(type, fn as unknown as EmitterMethod)
  }

  off<T extends EventsKeys>(type: T, fn: (params: EventParams[T]) => any) {
    super._off(type, fn as unknown as EmitterMethod)
  }

  emit<T extends EventsKeys>(type: T, args: EventParams[T]) {
    super._emit(type as string, args)
  }
}
