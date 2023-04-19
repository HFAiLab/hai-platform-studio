/* eslint-disable @typescript-eslint/ban-types */
import type {
  GetTaskCurrentPerfV2Params,
  GetTaskCurrentPerfV2Result,
  NodeUsageSeriesResult,
} from '@hai-platform/client-ailab-server'
import type {
  GetClusterOverviewForClientResult,
  GetUserTaskParams,
  GetUserTaskResult,
  GetUserTasksParams,
  GetUserTasksResult,
  ServiceTaskTasksApiResult,
} from '@hai-platform/client-api-server'
import type { LogRespContent, SysLogRespContent, TaskOverview } from './fst-schema'

export * from './fst-schema'

export type OverViewType = 'gpu' | 'cpu'

type JSONValue = string | number | boolean | JSONObject | JSONArray

interface JSONObject {
  [x: string]: JSONValue
}

type JSONArray = Array<JSONValue>

export enum SubscribeCommands {
  Experiment2 = 'Experiment2',
  Experiments2 = 'Experiments2',
  ClusterOverview2 = 'ClusterOverview2',
  NodeUsageSeries = 'NodeUsageSeries',
  TaskOverview2 = 'TaskOverview2',
  TaskCurrentPerf2 = 'TaskCurrentPerf2',
  Log = 'Log',
  SysLog = 'SysLog',
  CurrentTrainings = 'CurrentTrainings',
  ServiceTasks = 'ServiceTasks',
}

export const FrontierForceRefresh = 'FrontierForceRefresh'
export const SocketFatalError = 'SocketFatalError'
export const InvokeSocketFatalError = 'InvokeSocketFatalError'

export interface ForceRefreshReq<Q extends SubscribeCommands> {
  command: Q
  query: SubQueryParams[Q]
}
// ====>

export interface TokenMixin {
  token: string
}

export interface URLMixin {
  marsServerURL?: string
  marsServerHost?: string
}

export interface UserNameMixin {
  userName: string
}

export interface LogSubParams {
  queryType: 'path' | 'chainId'
  key: string
  rank: number
  service?: string
}
export interface ChainIdOnlyParam {
  chainId: string
}

export type ExperimentsSubParamsFilterPart = Pick<
  GetUserTasksParams,
  | 'nb_name_pattern'
  | 'worker_status'
  | 'queue_status'
  | 'created_start_time'
  | 'created_end_time'
  | 'group'
  | 'tag'
  | 'excluded_tag'
>

export type SubQueryParams = {
  [SubscribeCommands.Experiment2]: GetUserTaskParams & URLMixin
  [SubscribeCommands.Experiments2]: GetUserTasksParams & UserNameMixin & URLMixin
  [SubscribeCommands.ClusterOverview2]: { taskType?: OverViewType | 'external' } & URLMixin
  [SubscribeCommands.TaskOverview2]: { taskType: OverViewType } & URLMixin
  [SubscribeCommands.TaskCurrentPerf2]: GetTaskCurrentPerfV2Params & URLMixin
  [SubscribeCommands.Log]: LogSubParams & TokenMixin & URLMixin
  [SubscribeCommands.SysLog]: ChainIdOnlyParam & TokenMixin & URLMixin
  [SubscribeCommands.CurrentTrainings]: TokenMixin & URLMixin
  [SubscribeCommands.NodeUsageSeries]: { type: OverViewType | 'external' } & URLMixin
  [SubscribeCommands.ServiceTasks]: {} & TokenMixin & URLMixin
}

// ====>

export interface SubChangeKeysParams {
  subChanges: string[]
}

// 都是 string[] 就先不用了
// export type SubChangeKeys = {
//     [SubscribeCommands.Experiment]: string[];
// }

export const SUB_LISTEN_ALL_KEYS = 'SUB_LISTEN_ALL_KEYS'

export const SubChangeKeysConfig = {
  [SubscribeCommands.Experiment2]: [
    'queue_status',
    'worker_status',
    'suspend_count',
    'priority',
    'whole_life_state',
    'star',
  ],
  [SubscribeCommands.Experiments2]: ['queue_status', 'worker_status', 'chain_id', 'star', 'tags'],
  [SubscribeCommands.ClusterOverview2]: SUB_LISTEN_ALL_KEYS,
  [SubscribeCommands.TaskOverview2]: SUB_LISTEN_ALL_KEYS,
  [SubscribeCommands.TaskCurrentPerf2]: SUB_LISTEN_ALL_KEYS,
  [SubscribeCommands.SysLog]: 'data',
  [SubscribeCommands.Log]: 'data',
  [SubscribeCommands.CurrentTrainings]: 'data',
  [SubscribeCommands.NodeUsageSeries]: SUB_LISTEN_ALL_KEYS,
  [SubscribeCommands.ServiceTasks]: [
    'status',
    'chain_status',
    'worker_status',
    'chain_id',
    'star',
    'runtime_config_json.service_task.services.jupyter.alive',
  ],
}

// ====>
export type ExperimentSubPayload = {
  errorCode: number
  [key: string]: any
}

export interface TaskOverviewRespContent {
  [key: string]: TaskOverview
}

export type ServiceTasksIOResult = Pick<ServiceTaskTasksApiResult, 'tasks'>

export type SubPayloadContents = {
  [SubscribeCommands.Experiment2]: GetUserTaskResult
  [SubscribeCommands.Experiments2]: GetUserTasksResult
  [SubscribeCommands.ClusterOverview2]: GetClusterOverviewForClientResult
  [SubscribeCommands.TaskOverview2]: TaskOverviewRespContent
  [SubscribeCommands.TaskCurrentPerf2]: GetTaskCurrentPerfV2Result
  [SubscribeCommands.Log]: LogRespContent
  [SubscribeCommands.SysLog]: SysLogRespContent
  [SubscribeCommands.CurrentTrainings]: any
  [SubscribeCommands.NodeUsageSeries]: NodeUsageSeriesResult
  [SubscribeCommands.ServiceTasks]: ServiceTasksIOResult
}

export interface SubPayload<T extends SubscribeCommands> {
  // hint: 长链接有可能会出现请求失败的情况，虽然请求失败，但是此时长链接是没有问题的，所以这个时候返回 null
  content: SubPayloadContents[T] | null
  query: SubQueryParams[T]
  changedKeys: string[]
}

// ====>
export enum SubOP {
  sub = 'sub',
  unsub = 'unsub',
}
export interface SubMeta<T extends SubscribeCommands> {
  // 查询参数
  query: SubQueryParams[T]
  op?: SubOP
}

export interface SubResponse<T extends SubscribeCommands> {
  payload: SubPayload<T>
}
