import type { ExperimentsSubParamsFilterPart } from '@hai-platform/studio-schemas'
import type { BaseApp } from '../../base/app'
import type { BaseContainerAPI } from '../../base/container'
import type { ManagerContainerAPI } from '../container'
import type { IManagerDispatch, IManagerState } from '../reducer'
import type { ManageAppInPages } from './app'

export interface ExpsPageManageState extends ExperimentsSubParamsFilterPart {
  showValidation: boolean

  pageSize: number

  currentPage: number

  selectChainId: string | null

  // 是否默认打开当前选择的日志，管理员
  defaultSelectLogOpen?: boolean
}

export interface ManagerServiceContextType {
  state: IManagerState
  dispatch: <T extends keyof IManagerState>(arg: IManagerDispatch<T>) => void
  batchDispatch: <T extends keyof IManagerState>(arg: IManagerDispatch<T>[]) => void
  app: BaseApp<ManagerContainerAPI & BaseContainerAPI> & ManageAppInPages
  reqType: 'http' | 'io'
}
