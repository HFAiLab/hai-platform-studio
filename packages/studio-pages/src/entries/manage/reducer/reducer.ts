import type { TaskCurrentPerfStat } from '@hai-platform/client-ailab-server'
import { SpecialTags } from '@hai-platform/shared'
import type { ExperimentsSubParamsFilterPart } from '@hai-platform/studio-schemas'
import type { Chain } from '../../../model/Chain'
import type { ExpsPageManageState } from '../schema'

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

export interface IManagerState {
  // 列表更新时间
  updatedAt: Date | null

  // 实验列表
  trainingsList: Array<Chain>

  // 选中的用作 batchStop 的 Chain
  selectChains: Array<Chain>

  // 自动打开日志
  autoShowLog: boolean

  // 记住实验管理的筛选条件
  experimentsFilterMemorize: boolean

  // 当前选中的 Chain
  currentSelectedChain: Chain | null

  // 总数量，分页用
  totalChainCount: number

  // 自定义展示的列
  trainingsCustomColumns: (keyof TaskCurrentPerfStat)[]

  // 需要和 url 联动的页面信息
  manageState: ExpsPageManageState
}

export type IManagerDispatch<T extends keyof IManagerState> =
  | {
      type: T
      value: IManagerState[T]
    }
  | {
      type: 'manageState'
      value: Partial<ExpsPageManageState>
    }

export interface GetManagerReducerOptions {
  pageStateChangeCallback: (manageState: ExpsPageManageState) => void
}

export const getManagerReducer = ({ pageStateChangeCallback }: GetManagerReducerOptions) => {
  return function managerReducer<T extends keyof IManagerState>(
    state: IManagerState,
    actions: { type: T; value: Partial<IManagerState[T]> }[],
  ) {
    const ret = { ...state }

    for (const action of actions) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.hasOwnProperty(action.type)) {
        try {
          if (action.type === 'manageState') {
            ret[action.type] = {
              ...(ret[action.type] as ExpsPageManageState),
              ...action.value,
            } as ExpsPageManageState as IManagerState[T]
            pageStateChangeCallback(ret[action.type] as ExpsPageManageState)
          } else {
            ret[action.type] = action.value as IManagerState[T]
          }
        } catch (e) {
          console.error('reduce error:', e)
        }
      }
    }

    return ret
  }
}

export const getDefaultFilterParams = (): ExperimentsSubParamsFilterPart => {
  return {
    nb_name_pattern: undefined,
    worker_status: [],
    queue_status: [],
    created_start_time: undefined,
    created_end_time: undefined,
    group: [],
    tag: [],
    excluded_tag: [SpecialTags.HIDDEN],
  }
}

export const getDefaultManageState = (): ExpsPageManageState => {
  return {
    ...getDefaultFilterParams(),
    showValidation: false,
    pageSize: NaN, // 这个是需要计算得出来，所以默认是 NaN
    currentPage: 1,
    selectChainId: null,
    defaultSelectLogOpen: false,
  }
}

export function initManagerState(p: {
  autoShowLog: boolean
  experimentsFilterMemorize: boolean
  trainingsCustomColumns: (keyof TaskCurrentPerfStat)[]
  manageState?: ExpsPageManageState | null
}): IManagerState {
  return {
    manageState: p.manageState || getDefaultManageState(),
    autoShowLog: p.autoShowLog ?? false,
    experimentsFilterMemorize: p.experimentsFilterMemorize ?? true,
    selectChains: [],
    currentSelectedChain: null,
    totalChainCount: 0,
    trainingsList: [],
    updatedAt: null,
    // ref: packages/studio-pages/src/entries/manage/reducer/reducer.ts
    trainingsCustomColumns: window.is_hai_studio
      ? []
      : p.trainingsCustomColumns || ['gpu_util', 'gpu_power', 'gpu_p2u', 'ib_rx', 'ib_tx'],
  }
}
