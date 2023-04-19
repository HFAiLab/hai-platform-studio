/**
 * 任务所在组
 *
 * 该字段并不是枚举字段，只是顺便在这里列出部分可能值，所以最后还是覆盖为 string 类型
 */
export type TaskGroup = string

/**
 * 任务优先级
 */
export enum TaskPriority {
  /**
   * 一般给外部用户使用
   *
   * @name AUTO
   */
  AUTO = -1,

  /**
   * 已弃用，还会被手动调度到
   *
   * @name LOW
   * @deprecated
   */
  LOW = 0,

  /**
   * 已弃用，还会被手动调度到
   *
   * @name BELOW_NORMAL
   * @deprecated
   */
  BELOW_NORMAL = 5,

  /**
   * 已弃用，还会被手动调度到
   *
   * @name NORMAL
   * @deprecated
   */
  NORMAL = 10,

  /**
   * @name ABOVE_NORMAL
   */
  ABOVE_NORMAL = 20,

  /**
   * @name HIGH
   */
  HIGH = 30,

  /**
   * @name VERY_HIGH
   */
  VERY_HIGH = 40,

  /**
   * @name EXTREME_HIGH
   */
  EXTREME_HIGH = 50,
}

/**
 * 任务排队状态
 *
 */
export enum TaskQueueStatus {
  /**
   * 排队中
   */
  QUEUED = 'queued',

  /**
   * 已调度
   */
  SCHEDULED = 'scheduled',

  /**
   * 已完成
   */
  FINISHED = 'finished',
}

/**
 * 任务打断信号
 *
 */
export enum TaskSuspendCode {
  /**
   * 不需要打断
   */
  NO_SUSPEND = 0,

  /**
   * 发送打断通知
   */
  SUSPEND_SENT = 1,

  /**
   * 任务节点表示收到打断通知
   */
  SUSPEND_RECEIVED = 2,

  /**
   * 任务表示可以被打断
   */
  CAN_SUSPEND = 3,
}

/**
 * 任务类型
 *
 */
export enum TaskTaskType {
  UPGRADE_TASK = 'upgrade',
  TRAINING_TASK = 'training',
  JUPYTER_TASK = 'jupyter',
  VIRTUAL_TASK = 'virtual',
  VALIDATION_TASK = 'validation',
  SYSTEM_TASK = 'system',
  BACKGROUND_TASK = 'background',
}

/**
 * 任务 Worker 状态，是多个 POD 的聚合状态
 *
 * hint: 和 packages/shared/src/types/pod/pod-properties.ts 中的 PodStatus 比较类似，有改动请一同考虑
 *
 * 优先级从高到低：
 *  failed（只要有 pod failed，过段时间这个任务一定 failed）
 *  stopped（只要有 pod stopped 且没有 failed，过段时间这个任务一定 stopped）
 *  failed_terminating, stopped_terminating（意味着过会儿这个任务会 failed 或者 stopped）
 *  created（任务卡在了 init_manager 这里）
 *  building（很有可能 manager 卡住了）
 *  running（最正常的情况，只要没有以上异常态，并且有至少一个 pod 在 running，才是 running）
 *  succeeded_terminating（所有任务都 succeeded_terminating 或者 succeeded，且至少有一个 succeeded_terminating，才能是 succeeded_terminating）
 *  succeeded（只有当所有任务都是 succeeded 才能是 succeeded，在这之前会经历 succeeded_terminating）
 *  queued（任务只有在一开始才能是 queued）
 *  cancel（任务从 queued 直接变到 stopped）
 *
 * 复合态取优先级较高的状态，例如 pod 分别为 created, running, succeeded_terminating，最终应为 created
 *
 * 因此 worker_status 有以下几种可能性：
 *  failed stopped succeeded canceled
 *  queued
 *  created building
 *  failed_terminating succeeded_terminating stopped_terminating
 *  running
 */
export enum TaskWorkerStatus {
  FAILED = 'failed',
  STOPPED = 'stopped',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',

  QUEUED = 'queued',

  CREATED = 'created',
  BUILDING = 'building',

  FAILED_TERMINATING = 'failed_terminating',
  SUCCEEDED_TERMINATING = 'succeeded_terminating',
  STOPPED_TERMINATING = 'stopped_terminating',

  RUNNING = 'running',
}

/**
 * 实验状态
 *
 * 不是数据库中的标准字段
 *
 */
export enum TaskChainStatus {
  /**
   * 待初始化
   */
  WAITING_INIT = 'waiting_init',

  /**
   * 运行中
   */
  RUNNING = 'running',

  /**
   * 被打断
   */
  SUSPENDED = 'suspended',

  /**
   * 已完成
   */
  FINISHED = 'finished',
}

/**
 * 开发容器的一个状态
 */
export enum ContainerTaskStatus {
  STOPPED = 'stopped',
  FINISHED = 'finished',
  QUEUED = 'queued',
  CREATED = 'created',
  BUILDING = 'building',
  RUNNING = 'running',
  TERMINATING = 'terminating',
}

/**
 * 任务调度的区域
 */
export enum TaskScheduleZone {
  A = 'A',
  B = 'B',
  FFFS_heavy = '3FS_heavy',
  FFFS_light = '3FS_light',
}

// 默认自动调度，不指定 zone
export type TaskScheduleZoneConfig = TaskScheduleZone | null
