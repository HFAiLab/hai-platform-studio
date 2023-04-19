// hint: 这个文件已经基本没什么用了，但是为了避免以后可能用到，结构体先暂时都还保留着，可以暂时当个模板
import type React from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HomeState {
  // 如果有其他的类型的，直接在这里加
}

export function homeReducerInit(): HomeState {
  return {} as HomeState
}

export enum ActionTypes {}

export interface HomeActionParams {
  type: ActionTypes
}

export function homeReducer(state: HomeState, action: HomeActionParams): HomeState {
  switch (action.type) {
    default:
      return {
        ...state,
      }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeDispatchWrapper(dispatch: React.Dispatch<HomeActionParams>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function dispatchImpl(params: HomeActionParams) {
    // do nothing
  }
}
