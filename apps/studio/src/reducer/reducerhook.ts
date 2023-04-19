import { getHashRoutePath, getHashedSearch, setHashedSearch } from '../utils/urlParams'

export interface ReducerHooks<T> {
  /**
   * 初次生成 State 状态时使用
   */
  genInit(): T

  /**
   * 在 reducer 去更新状态时调用
   */
  onStateUpdate(state: T): void

  /**
   * 当 route 发生变化时调用
   */
  onRouteChange(state: T): void
}

/**
 * 该 hook 会在状态改变时重设 URL Hash 中的 query 部分
 * 初始化时会从 url 中获取状态的值来覆盖默认值
 */
export class ReducerUrlChangeHooks<T> implements ReducerHooks<T> {
  // 默认值
  defaultState: T

  // 在哪些路由下可用
  enabledHashPath: string[]

  // 哪些字段会从 url 里读写
  selectedFields: Array<keyof T> | undefined

  constructor(option: {
    defaultState: T
    enabledHashPath: string[]
    selectedFields?: Array<keyof T>
  }) {
    this.selectedFields = option.selectedFields
    this.defaultState = option.defaultState
    this.enabledHashPath = option.enabledHashPath
  }

  protected getParamsFromUrl(): T {
    const currentRoutePath = getHashRoutePath()
    if (!currentRoutePath || !this.enabledHashPath.includes(currentRoutePath)) {
      return { ...this.defaultState } as T
    }
    return getHashedSearch({
      defaultValues: this.defaultState as Record<string, any>,
      selectedFields: this.selectedFields as string[] | undefined,
    }) as unknown as T
  }

  protected setParamsToUrl(state: T) {
    const currentRoutePath = getHashRoutePath()
    if (!currentRoutePath || !this.enabledHashPath.includes(currentRoutePath)) {
      return
    }
    const toSet = {} as Partial<T>
    const fields = this.selectedFields ?? Object.keys(this.defaultState as Record<string, unknown>)
    for (const key of fields) {
      const k = key as keyof T
      if (state[k] === this.defaultState[k]) {
        continue
      }
      toSet[k] = state[k]
    }
    setHashedSearch(toSet, false)
  }

  genInit() {
    const init = this.getParamsFromUrl()
    return init
  }

  onStateUpdate(state: T) {
    this.setParamsToUrl(state)
  }

  onRouteChange(state: T) {
    this.onStateUpdate(state)
  }
}

// 这里给出一个覆盖部分参数的示例：
// export class ExpsPageManageReducerUrlChangeHook extends ReducerUrlChangeHooks<ExpsPageManageState> {
//   protected override getParamsFromUrl(): ExpsPageManageState {}
// }
