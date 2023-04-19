/**
 * 任务训练类型
 */
export enum TaskTrainingType {
  /**
   * GPU 训练
   */
  GPU = 'GPU',

  /**
   * CPU 训练
   */
  CPU = 'CPU',
}

/**
 * 任务排队状态
 */
export const enum TasksQueueStatus {
  /**
   * 排队中
   */
  QUEUED = 'queued',

  /**
   * 工作中
   */
  WORKING = 'working',
}

/**
 * 任务排队信息数值类型
 */
export const enum TasksQueueValueType {
  /**
   * 节点数
   */
  NODES = 'nodes',

  /**
   * 任务数
   */
  TASKS = 'tasks',
}
