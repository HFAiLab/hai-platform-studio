/* eslint-disable @typescript-eslint/no-namespace */
export const CONSTS = {
  WORKSPACE_ROOT_STR: '<workspace_root>',
  INVALID_GROUP: 'FAILED',
  DEFAULT_PRIORITY_VALUE_INTERNAL: 30,
  DEFAULT_PRIORITY_VALUE_EXTERNAL: -1,
  MEM_METRICS_REFRESH_INTERVAL_SEC: 5,
  CLUSTER_REFRESH_INTERVAL_SEC: 30,
  EXPS_LAST_RESUME_CHAIN_ID_LIST: 'EXPS_LAST_RESUME_CHAIN_ID_LIST', // 上次 resume 的实验，主要用于事件触发重新订阅用
  DEFAULT_LOG_SERVICE_NAME: '[default]',
  ChainDelayGroupRegex: /_DELAY.*$/,
}
