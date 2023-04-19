export const defaultState = {
  value: 0,
}

export function reducer(state: any, action: any) {
  switch (action.type) {
    case 'ADD_NUM':
      return { ...state, value: state.value + 1 }
    case 'REDUCE_NUM':
      return { ...state, value: state.value - 1 }
    default:
      throw new Error()
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IManagerState {}

export type IManagerDispatch<T extends keyof IManagerState> = { type: T; value: IManagerState[T] }

export function managerReducer<T extends keyof IManagerState>(
  state: IManagerState,
  action: { type: T; value: IManagerState[T] },
) {
  // eslint-disable-next-line no-prototype-builtins
  if (state.hasOwnProperty(action.type)) {
    const ret = { ...state }
    ret[action.type] = action.value
    return ret
  }
  throw new Error(`${action.type} is not valid key to set`)
}

export function initManagerState(): IManagerState {
  return {}
}
