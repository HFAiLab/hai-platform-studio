import type {
  GetTrainImagesResult,
  ServiceTaskTasksApiResult,
} from '@hai-platform/client-api-server'
import type { IClusterInfoUsage, IQuotaMap, TaskCreateYamlSchemaV2 } from '@hai-platform/shared'
// @ts-expect-error ignore schema
import stableStringify from 'fast-stable-stringify'
import React from 'react'
import type { Chain } from '../../../model/Chain'
import type { BaseApp } from '../../base/app'
import type { BaseContainerAPI } from '../../base/container'
import type { Experiment2ContainerAPI } from '../container'
import { getDraftFromLocalStorage, updateDraftToLocalStorage } from '../funcs/DraftManager'
import type { PriorityInfo } from '../schema'
import type { Exp2CreateParams, IExp2StateByProps } from '../schema/params'

export interface IExp2State extends IExp2StateByProps {
  // 实验，jupyter 有关的当前的内容：
  chain: Chain | null
  chainYamlSchema: TaskCreateYamlSchemaV2 | null
  chainYamlString: string
  showYAML: boolean
  hubData: ServiceTaskTasksApiResult | null

  globalInitLoading: boolean

  // 新建实验的一些内容：
  createParams: Exp2CreateParams | null

  // 自己修改的实验参数，应该存在这里
  createDraft: Partial<Exp2CreateParams>

  // 新建实验下拉框选择的一些内容：
  sourceClusterUsage: Array<IClusterInfoUsage>
  sourceTrainImages: GetTrainImagesResult | null
  sourcePriorityList: Array<PriorityInfo>
  sourceQuotaMap: IQuotaMap | null
  // currentUser: StudioUser | null
}

export type IExp2Dispatch<T extends keyof IExp2State> = { type: T; value: IExp2State[T] }

export function exp2Reducer<T extends keyof IExp2State>(
  state: IExp2State,
  actions: { type: T; value: IExp2State[T] }[],
) {
  const ret = { ...state }
  for (const action of actions) {
    if (action.type in state) {
      if (action.type === 'createDraft') {
        updateDraftToLocalStorage(
          {
            queryType: state.queryType,
            queryValue: state.queryValue, // chainId | nb_name
          },
          action.value as Partial<Exp2CreateParams>,
        )
      }
      ret[action.type] = action.value
    }
  }
  return ret
}

export function initExp2State(props: IExp2StateByProps): IExp2State {
  return {
    ...props,
    chain: null,
    chainYamlSchema: null,
    chainYamlString: '',
    showYAML: false,
    hubData: null,

    createParams: null,
    createDraft: getDraftFromLocalStorage(props),

    globalInitLoading: true,

    sourceClusterUsage: [],
    sourceTrainImages: null,
    sourcePriorityList: [],
    sourceQuotaMap: null,
    // currentUser: null,
  }
}

export const IfParamChangeInDraft = (state: IExp2State, key: keyof Exp2CreateParams) => {
  if (state.createDraft && key in state.createDraft) {
    if (state.createDraft[key] instanceof Object && state.createParams?.[key] instanceof Object) {
      return stableStringify(state.createDraft[key]) !== stableStringify(state.createParams?.[key])
    }
    return state.createDraft[key] !== state.createParams?.[key]
  }

  return false
}

export const ExpServiceContext = React.createContext<{
  state: IExp2State
  dispatch: <T extends keyof IExp2State>(arg: IExp2Dispatch<T>) => void
  batchDispatch: <T extends keyof IExp2State>(arg: IExp2Dispatch<T>[]) => void
  app: BaseApp<Experiment2ContainerAPI & BaseContainerAPI>
  reqType: 'http' | 'io'
  // @ts-expect-error ignore null error
}>(null)
