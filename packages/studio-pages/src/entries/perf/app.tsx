import type { EmitterMethod } from 'event-emitter'
import React, { useReducer } from 'react'
import ReactDOM from 'react-dom'
import { QueryClientProvider } from 'react-query'
import { BaseApp } from '../base/app'
import type { BaseContainerAPI } from '../base/container'
import type { PerfContainerAPI } from './container'
import { queryClient } from './query'
import { defaultState, reducer } from './reducer'
import type { EventParams, EventsKeys } from './schema/event'
import type { ChartBlockProps } from './widgets/ChartBlock'
// eslint-disable-next-line import/no-cycle
import { ChartBlock } from './widgets/ChartBlock'

export const ServiceContext = React.createContext<{
  state: any
  dispatch: any
  app: PerfApp
  // @ts-expect-error ignore null
}>(null)

const PerfEntrance = (props: { app: PerfApp; reqType: 'http' | 'io'; props: ChartBlockProps }) => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ServiceContext.Provider value={{ state, dispatch, app: props.app }}>
      <QueryClientProvider client={queryClient}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ChartBlock {...props.props} />
      </QueryClientProvider>
    </ServiceContext.Provider>
  )
}

export class PerfApp extends BaseApp<PerfContainerAPI & BaseContainerAPI> {
  reqType: 'http' | 'io'

  started: boolean

  props: ChartBlockProps | null = null

  constructor(container_api: PerfContainerAPI & BaseContainerAPI) {
    super(container_api)
    this.reqType = 'io'
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

  start = (props: ChartBlockProps) => {
    this.props = props
    this.prepare()
    this.started = true
    this.render(this.props)
  }

  update = (props: ChartBlockProps) => {
    this.props = props
    this.render(this.props)
  }

  render(props: ChartBlockProps) {
    ReactDOM.render(
      <React.StrictMode>
        <PerfEntrance app={this} reqType={this.reqType} props={props} />
      </React.StrictMode>,
      this.api().getContainer(),
    )
  }

  override stop = () => {
    const res = ReactDOM.unmountComponentAtNode(this.api().getContainer())
    this.api().getLogger().info(`PerfApp stop res:${res}`)
  }
}
