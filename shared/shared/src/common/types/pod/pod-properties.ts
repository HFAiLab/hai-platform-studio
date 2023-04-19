/**
 * Pod 角色
 */
export enum PodRole {
  MASTER = 'master',
  WORKER = 'worker',
}

/**
 * Pod 状态
 *
 * hint: 和 packages/shared/src/types/task/task-properties.ts 中的 TaskWorkerStatus 比较类似，有改动请一同考虑
 *
 * 区别：
 *   1. 没有 canceled
 *   2. 多了 unknown 和 unschedulable
 *
 */
export enum PodStatus {
  FAILED = 'failed',
  STOPPED = 'stopped',
  SUCCEEDED = 'succeeded',

  QUEUED = 'queued',

  CREATED = 'created',
  BUILDING = 'building',

  FAILED_TERMINATING = 'failed_terminating',
  SUCCEEDED_TERMINATING = 'succeeded_terminating',
  STOPPED_TERMINATING = 'stopped_terminating',

  RUNNING = 'running',

  UNKNOWN = 'unknown',
  UNSCHEDULABLE = 'unschedulable',
}
