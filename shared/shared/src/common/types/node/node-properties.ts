/**
 * 节点状态
 */
export enum NodeStatus {
  READY = 'Ready',
  NOT_READY = 'NotReady',
  SCHEDULING_DISABLED = 'SchedulingDisabled',
}

/**
 * 节点类型
 */
export enum NodeType {
  CPU = 'cpu',
  GPU = 'gpu',
}

/**
 * 节点所在调度空间
 */
export enum NodeScheduleZone {
  A = 'A',
  B = 'B',
}

/**
 * 节点当前类别
 */
export enum NodeCurrentCategory {
  /**
   * 开发
   */
  DEV = 'dev',

  /**
   * 出错
   */
  ERR = 'err',

  /**
   * 独占
   */
  EXCLUSIVE = 'exclusive',

  /**
   * 待上线
   */
  RELEASE = 'release',

  /**
   * 服务
   */
  SERVICE = 'service',

  /**
   * 训练
   */
  TRAINING = 'training',
}
