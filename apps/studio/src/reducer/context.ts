import React from 'react'
import type { DispatcherType, GlobalState, IGlobalDispatch } from './index'

export interface GlobalContextContentType {
  state: GlobalState
  dispatch: <T extends keyof GlobalState>(arg: IGlobalDispatch<T>[]) => void
  dispatchers: DispatcherType
}

// @ts-expect-error ignore null
export const GlobalContext = React.createContext<GlobalContextContentType>(null)
