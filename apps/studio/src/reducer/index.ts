import type {
  XTopicListOrderKeys,
  XTopicNotificationListParams,
  XTopicNotificationListResult,
  XTopicUserDetailResult,
} from '@hai-platform/client-ailab-server'
import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { getDefaultManageState } from '@hai-platform/studio-pages/lib/entries/manage/reducer'
import type { ExpsPageManageState } from '@hai-platform/studio-pages/lib/entries/manage/schema'
import type { AllFatalErrorsType } from '@hai-platform/studio-pages/lib/socket'
import { IoStatus } from '@hai-platform/studio-pages/lib/socket'
import { GlobalAilabServerClient } from '../api/ailabServer'
import { ContainerOpEnum } from '../pages/jupyter/schema'
import type { ReducerHooks } from './reducerhook'
import { ReducerUrlChangeHooks } from './reducerhook'

export interface XTopicListPageState {
  pageSize: number
  page: number // TBD: 从 0 还是从 1
  category: string | undefined
  tags: string[] // 不填代表全选
  keyword: string | undefined
  orderBy: XTopicListOrderKeys
  invokingNickNameEditor: boolean
  onlyAboutMe: boolean // 为 true 代表与我有关
}
export interface JupyterManagePageState {
  op: ContainerOpEnum
  filterKw: string
}
export interface DatasetPageState {
  page: number
  keyword: string
  tags: string[]
  onlyPrivate: boolean
  adminMode: boolean
}

export type ExpsPageState = ExpsPageManageState

export interface AdminState {
  tab: string | undefined
}

export const xTopicPageSizeLists = [10, 20, 30] as const

export const defaultXTopicListPageState: XTopicListPageState = {
  pageSize: xTopicPageSizeLists[0],
  page: 1,
  category: undefined,
  tags: [],
  keyword: '',
  orderBy: 'createdAt',
  invokingNickNameEditor: false,
  onlyAboutMe: false,
}

export interface GlobalState {
  ioStatus: IoStatus
  ioLastError: AllFatalErrorsType | null
  inDebug: boolean
  jupyterManagePageState: JupyterManagePageState
  datasetPageState: DatasetPageState
  adminState: AdminState
  expsPageManageState: ExpsPageState
  xTopicListPageState: XTopicListPageState
  xTopicUser: XTopicUserDetailResult | null
  xTopicNotification: XTopicNotificationListResult | null
}

export const HooksMap = {
  xTopicListPageState: new ReducerUrlChangeHooks({
    defaultState: defaultXTopicListPageState,
    enabledHashPath: ['/topic'],
    selectedFields: ['category', 'keyword', 'onlyAboutMe', 'orderBy', 'page', 'pageSize', 'tags'],
  }),
  jupyterManagePageState: new ReducerUrlChangeHooks({
    defaultState: { op: ContainerOpEnum.userList, filterKw: '' },
    enabledHashPath: ['/container'],
  }),
  datasetPageState: new ReducerUrlChangeHooks({
    defaultState: { adminMode: false, keyword: '', onlyPrivate: false, page: 1, tags: [] },
    enabledHashPath: ['/datasets'],
  }),
  expsPageManageState: new ReducerUrlChangeHooks({
    defaultState: { ...getDefaultManageState(), showLogIds: [] },
    enabledHashPath: ['/manage'],
  }),
  adminState: new ReducerUrlChangeHooks({
    defaultState: { tab: undefined },
    enabledHashPath: ['/admin'],
  }),
} as Partial<{ [K in keyof GlobalState]: ReducerHooks<GlobalState[K]> }>

export const defaultState: GlobalState = {
  ioStatus: IoStatus.none,
  ioLastError: null,
  inDebug: false,
  jupyterManagePageState: HooksMap.jupyterManagePageState!.genInit(),
  xTopicListPageState: HooksMap.xTopicListPageState!.genInit(),
  datasetPageState: HooksMap.datasetPageState!.genInit(),
  adminState: HooksMap.adminState!.genInit(),
  expsPageManageState: HooksMap.expsPageManageState!.genInit(),
  xTopicUser: null,
  xTopicNotification: null,
}

export function reducer(state: any, action: any) {
  switch (action.type) {
    default:
      throw new Error()
  }
}

export type IGlobalDispatch<T extends keyof GlobalState> = { type: T; value: GlobalState[T] }

// HINT：reducer 中有对 hook 的调用，会产生副作用
export function basicReducer<T extends keyof GlobalState>(
  state: GlobalState,
  actions: IGlobalDispatch<T>[],
) {
  const ret = { ...state }

  for (const action of actions) {
    if (action.type in state) {
      ret[action.type] = action.value
      // HINT：此调用会产生副作用
      HooksMap[action.type]?.onStateUpdate(action.value)
    } else {
      throw new Error(`${action.type} is not valid key to set`)
    }
  }
  return ret
}

export function initGlobalState(): GlobalState {
  return defaultState
}

export const getDispatchers = (
  dispatch: <T extends keyof GlobalState>(args: IGlobalDispatch<T>[]) => void,
) => {
  return {
    updateXTopicUser: () => {
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_USER_DETAIL).then((u) => {
        dispatch([
          {
            type: 'xTopicUser',
            value: u,
          },
        ])
      })
    },
    updateXTopicNotifications: (options?: XTopicNotificationListParams, callback?: () => void) => {
      GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_NOTIFICATION_LIST, options).then(
        (u) => {
          dispatch([
            {
              type: 'xTopicNotification',
              value: u,
            },
          ])
          if (callback) callback()
        },
      )
    },
    updateGlobalDebugState: (debug: boolean) => {
      dispatch([
        {
          type: 'inDebug',
          value: debug,
        },
      ])
    },
  }
}

export type DispatcherType = ReturnType<typeof getDispatchers>
