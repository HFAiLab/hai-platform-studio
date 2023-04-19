import type { EmitterMethod } from 'event-emitter'
import React, { useReducer } from 'react'
import ReactDOM from 'react-dom'
import type { AllFatalErrorsType } from '../../socket/index'
import { IOFrontier } from '../../socket/index'
import { CountlyEventKey } from '../../utils/countly/countly'
import { BaseApp } from '../base/app'
import type { BaseContainerAPI } from '../base/container'
import type { Experiment2ContainerAPI } from './container'
import type { IExp2Dispatch, IExp2State } from './reducer'
import { ExpServiceContext, exp2Reducer, initExp2State } from './reducer'
import type { EventParams, EventsKeys } from './schema/event'
import type { IExp2StateByProps } from './schema/params'
import { ExperimentPanelContainer } from './widgets/index'

const ExperimentEntrance = (props: {
  app: Experiment2App
  reqType: 'http' | 'io'
  pprops: IExp2StateByProps
}) => {
  const [state, dispatch] = useReducer(exp2Reducer, props.pprops, initExp2State)
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context = {
    state,
    dispatch: <T extends keyof IExp2State>(arg: IExp2Dispatch<T>) => {
      dispatch([arg])
    },
    batchDispatch: dispatch,
    app: props.app,
    reqType: props.reqType,
  }
  return (
    <ExpServiceContext.Provider value={context}>
      <ExperimentPanelContainer />
    </ExpServiceContext.Provider>
  )
}

export class Experiment2App extends BaseApp<Experiment2ContainerAPI & BaseContainerAPI> {
  reqType: 'http' | 'io' = 'io'

  started = false

  props: IExp2StateByProps | null = null

  // constructor(container_api: Experiment2ContainerAPI & BaseContainerAPI) {
  //   super(container_api)
  // }

  start = (props: IExp2StateByProps) => {
    this.props = props

    this.prepare()
    const token = this.api().getToken()
    IOFrontier.lazyInit(token)
    IOFrontier.getInstance().setLogger(this.api().getLogger())
    this.started = true
    this.render(this.props)
    // hint: 这个 callback 如果放在前面，可能还没有 start 和 render 就来了 callback，导致出现一些问题
    IOFrontier.addFatalErrorCallback(this.ioFatalErrorCallback)
    IOFrontier.addConnectedCallback(this.connectedCallback)
    IOFrontier.addDisConnectCallback(this.disConnectedCallback)
    this.api().countlyReportEvent(CountlyEventKey.Exp2Init)
  }

  update = (props: IExp2StateByProps) => {
    this.props = props
    this.render(this.props)
  }

  override stop = () => {
    IOFrontier.removeFatalErrorCallback(this.ioFatalErrorCallback)
    IOFrontier.removeConnectedCallback(this.connectedCallback)
    IOFrontier.removeDisConnectCallback(this.disConnectedCallback)
    const res = ReactDOM.unmountComponentAtNode(this.api().getContainer())
    this.api().getLogger().info(`ExperimentApp stop res:${res}`)
  }

  render(props: IExp2StateByProps) {
    ReactDOM.render(
      <React.StrictMode>
        <ExperimentEntrance app={this} reqType={this.reqType} pprops={props} />
      </React.StrictMode>,
      this.api().getContainer(),
    )
  }

  ioFatalErrorCallback = (error: AllFatalErrorsType) => {
    this.api().getLogger().info(`ioFatalErrorCallback: ${error}`)
    if (!this.started) return
    this.reqType = 'http'
    this.render(this.props!)
  }

  connectedCallback = () => {
    if (!this.started) return
    this.reqType = 'io'
    this.render(this.props!)
  }

  disConnectedCallback = () => {}

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
