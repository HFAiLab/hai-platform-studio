import type { Chain } from '../../../model/Chain'

export interface ILogState {
  theme: string
  chain: Chain | null
  rank: number
  visibility: boolean
  service?: string
}

export type ILogDispatch<T extends keyof ILogState> = { type: T; value: ILogState[T] }

export function logReducer<T extends keyof ILogState>(
  state: ILogState,
  action: { type: T; value: ILogState[T] },
) {
  // eslint-disable-next-line no-prototype-builtins
  if (state.hasOwnProperty(action.type)) {
    const ret = { ...state }
    ret[action.type] = action.value
    return ret
  }
  throw new Error(`${action.type} is not valid key to set`)
}

export function initLogState(p: {
  theme: string
  chain: Chain | null
  rank: number
  service?: string
}): ILogState {
  return {
    theme: p.theme,
    chain: p.chain,
    rank: p.rank,
    service: p.service,
    visibility: true,
  }
}
