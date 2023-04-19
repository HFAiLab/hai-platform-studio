/**
 * 一种较为通用的节点性能数据自定义格式
 * 目前 cpu、gpu、mem、ib 都可以支持这几种格式
 */
export interface TaskNodesContainerMonitorStat {
  // 节点：CPU 或 memory
  [key: string]: number | null | undefined
}
