import type { TaskCurrentPerfStat } from '@hai-platform/client-ailab-server'
import type { Chain } from '../../../model/Chain'
import type { ExpsPageManageState } from './context'

export enum ExpsManageServiceNames {
  getAutoShowLog = 'getAutoShowLog',
  setAutoShowLog = 'setAutoShowLog',
  getExperimentsFilterMemorize = 'getExperimentsFilterMemorize',
  setExperimentsFilterMemorize = 'setExperimentsFilterMemorize',
  setCurrentChain = 'setCurrentChain',
  emitChainChanged = 'emitChainChanged',
  openLog = 'openLog',
  getUserName = 'getUserName',
  getTrainingsColumns = 'getTrainingsColumns',
  setTrainingsColumns = 'setTrainingsColumns',
  getDefaultManageState = 'getDefaultManageState',
  setPageState = 'setPageState',
}

export enum LogModuleVersion {
  V1 = 1,
  V2 = 2,
}

export type ExpsManageServiceParams = {
  [ExpsManageServiceNames.getAutoShowLog]: null
  [ExpsManageServiceNames.setAutoShowLog]: boolean
  [ExpsManageServiceNames.getExperimentsFilterMemorize]: null
  [ExpsManageServiceNames.setExperimentsFilterMemorize]: boolean
  [ExpsManageServiceNames.setCurrentChain]: Chain | null
  [ExpsManageServiceNames.openLog]: {
    chain: Chain
    rank: number
    queryType: 'chainId' | 'path'
    ignoreRank: boolean
  }
  [ExpsManageServiceNames.emitChainChanged]: { chainId: Chain['chain_id']; sender: string }
  [ExpsManageServiceNames.getUserName]: null
  [ExpsManageServiceNames.getTrainingsColumns]: null
  [ExpsManageServiceNames.setTrainingsColumns]: (keyof TaskCurrentPerfStat)[]
  [ExpsManageServiceNames.getDefaultManageState]: null
  [ExpsManageServiceNames.setPageState]: ExpsPageManageState
}

export type ExpsManageServiceResult = {
  [ExpsManageServiceNames.getAutoShowLog]: boolean
  [ExpsManageServiceNames.setAutoShowLog]: void
  [ExpsManageServiceNames.getExperimentsFilterMemorize]: boolean
  [ExpsManageServiceNames.setExperimentsFilterMemorize]: void
  [ExpsManageServiceNames.setCurrentChain]: void
  [ExpsManageServiceNames.openLog]: void
  [ExpsManageServiceNames.emitChainChanged]: void
  [ExpsManageServiceNames.getUserName]: string
  [ExpsManageServiceNames.getTrainingsColumns]: (keyof TaskCurrentPerfStat)[]
  [ExpsManageServiceNames.setTrainingsColumns]: boolean
  [ExpsManageServiceNames.getDefaultManageState]: ExpsPageManageState | null
  [ExpsManageServiceNames.setPageState]: boolean
}

export enum AsyncExpsManageServiceNames {
  openFile = 'openFile',
  reflushClusterInfo = 'reflushClusterInfo',
}

export type AsyncExpsManageServiceParams = {
  [AsyncExpsManageServiceNames.openFile]: { path: string }
  [AsyncExpsManageServiceNames.reflushClusterInfo]: null
}

export type AsyncExpsManageServiceResult = {
  [AsyncExpsManageServiceNames.openFile]: boolean
  [AsyncExpsManageServiceNames.reflushClusterInfo]: null
}
