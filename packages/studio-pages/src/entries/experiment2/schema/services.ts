import type { ContainerTask } from '@hai-platform/shared'
import type { Chain } from '../../../model/Chain'
import type { IQueryType } from '../../../schemas/basic'
import type { OpenLogViewerParams } from '../widgets/nodes'
import type { CreateExperimentParams, HaiEnvItem } from './experiment'

export enum ServiceNames {
  getCurrentLogChain = 'getCurrentLogChain',
  openLogViewer = 'openLogViewer',
  showPerformance = 'showPerformance',
  quickOpenJupyter = 'quickOpenJupyter',
  openJupyterPanel = 'openJupyterPanel',
  openURLInNewTab = 'openURLInNewTab',
  maybeCreatedWithJupyter = 'maybeCreatedWithJupyter',
  getServerRoot = 'getServerRoot',
  getDirectoryList = 'getDirectoryList', // hint: 目前这里的假定它基本是不变的
  getUserGroupList = 'getUserGroupList',
}

export enum LogModuleVersion {
  V1 = 1,
  V2 = 2,
}

export enum ExpServiceAbilityNames {
  openFile = 'openFile',
  openJupyter = 'openJupyter',
  stopExperiment = 'stopExperiment',
  grafana = 'grafana',
}

export interface OpenURLInNewTabParams {
  name: string
  url: string
}

export interface ShowPerformanceParams {
  chain: Chain
  createrQueryType: IQueryType
}

export interface QuickOpenJupyterParams {
  jupyterTask: ContainerTask
  chain?: Chain | null
}

export type ServiceParams = {
  [ServiceNames.getCurrentLogChain]: null
  [ServiceNames.openLogViewer]: OpenLogViewerParams
  [ServiceNames.showPerformance]: ShowPerformanceParams
  [ServiceNames.quickOpenJupyter]: QuickOpenJupyterParams
  [ServiceNames.openJupyterPanel]: null
  [ServiceNames.openURLInNewTab]: OpenURLInNewTabParams
  [ServiceNames.maybeCreatedWithJupyter]: Chain
  [ServiceNames.getServerRoot]: null
  [ServiceNames.getDirectoryList]: null
  [ServiceNames.getUserGroupList]: null
}

export type ExpServiceResult = {
  [ServiceNames.getCurrentLogChain]: null
  [ServiceNames.openLogViewer]: null
  [ServiceNames.showPerformance]: null
  [ServiceNames.quickOpenJupyter]: null
  [ServiceNames.openJupyterPanel]: null
  [ServiceNames.openURLInNewTab]: null
  [ServiceNames.maybeCreatedWithJupyter]: boolean
  [ServiceNames.getServerRoot]: string
  [ServiceNames.getDirectoryList]: Array<string> | null
  [ServiceNames.getUserGroupList]: Array<string>
}

export enum AsyncServiceNames {
  getExperiment = 'getExperiment',
  createExperiment = 'createExperiment',
  editorReadyCheck = 'editorReadyCheck',
  getHaiEnvList = 'getHaiEnvList',
}

export type AsyncServiceParams = {
  [AsyncServiceNames.getExperiment]: null
  [AsyncServiceNames.createExperiment]: CreateExperimentParams
  [AsyncServiceNames.editorReadyCheck]: null
  [AsyncServiceNames.getHaiEnvList]: null
}

export interface IHaiEnvList {
  system: HaiEnvItem[]
  others: HaiEnvItem[]
  own: HaiEnvItem[]
}
export type AsyncServiceResult = {
  [AsyncServiceNames.getExperiment]: null
  [AsyncServiceNames.createExperiment]: any
  [AsyncServiceNames.editorReadyCheck]: void
  [AsyncServiceNames.getHaiEnvList]: IHaiEnvList
}
