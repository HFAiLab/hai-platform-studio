/**
 * 节点当前状态
 */
export enum NodeCurrentStatus {
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
   * 训练 - 空闲
   */
  TRAINING_FREE = 'training_free',

  /**
   * 训练 - 工作中
   */
  TRAINING_WORKING = 'training_working',

  /**
   * 训练 - 不可调度
   */
  TRAINING_UNSCHEDULABLE = 'training_unschedulable',
}
