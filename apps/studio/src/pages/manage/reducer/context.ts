import React from 'react'
import type { ReducerActions, ReducerActionsPayload, ReducerState } from '.'

export const ManagePageContext = React.createContext<{
  state: ReducerState
  // eslint-disable no-use-before-define
  dispatch: <T extends ReducerActions>(arg: {
    // eslint-disable no-use-before-define
    actionName: T
    payload: ReducerActionsPayload[T]
  }) => void
} | null>(null)
