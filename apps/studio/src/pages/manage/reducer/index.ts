import type { Chain } from '@hai-platform/studio-pages/lib/model/Chain'

export interface ReducerState {
  currentSelectChain: Chain | null
}

export const initialState = {
  currentSelectChain: null,
}

export enum ReducerActions {
  UpdateSelectChain = 'UpdateSelectChain',
}

export type ReducerActionsPayload = {
  [ReducerActions.UpdateSelectChain]: {
    currentSelectChain: Chain | null
  }
}

export function reducer<T extends ReducerActions>(
  state: ReducerState,
  action: {
    actionName: T
    payload: ReducerActionsPayload[T]
  },
) {
  if (action.actionName === ReducerActions.UpdateSelectChain) {
    return {
      ...state,
      currentSelectChain: action.payload.currentSelectChain,
    }
  }

  return {
    ...state,
  }
}
