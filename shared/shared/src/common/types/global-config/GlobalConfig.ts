export interface HaiConfig {
  schedulerDefaultGroup?: string
  schedulerErrorNodeMetaGroup?: string
  jupyterSharedNodeGroupPrefix?: string
  bffURL?: string
  jupyterURL?: string
  wsURL?: string
  clusterServerURL?: string
  countly?: {
    apiKey?: string
    url?: string
  }
}
