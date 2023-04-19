import type { Node } from '../../types'
import { NodeCurrentCategory, NodeStatus } from '../../types'
import { NodeCurrentStatus } from './defs'

/**
 * NodeCurrentStatus 需要根据后台返回的 current_category 和 working 等字段综合计算
 */
export const computeNodeCurrentStatus = (node: Node): NodeCurrentStatus => {
  // 开发
  if (node.current_category === NodeCurrentCategory.DEV) {
    return NodeCurrentStatus.DEV
  }
  // 出错
  if (node.current_category === NodeCurrentCategory.ERR) {
    return NodeCurrentStatus.ERR
  }
  // 独占
  if (node.current_category === NodeCurrentCategory.EXCLUSIVE) {
    return NodeCurrentStatus.EXCLUSIVE
  }
  // 待上线
  if (node.current_category === NodeCurrentCategory.RELEASE) {
    return NodeCurrentStatus.RELEASE
  }
  // 服务
  if (node.current_category === NodeCurrentCategory.SERVICE) {
    return NodeCurrentStatus.SERVICE
  }
  // 训练
  if (node.status === NodeStatus.READY) {
    // 训练 - 空闲
    if (node.working === null) {
      return NodeCurrentStatus.TRAINING_FREE
    }
    // 训练 - 工作中
    return NodeCurrentStatus.TRAINING_WORKING
  }
  // 训练 - 不可调度
  return NodeCurrentStatus.TRAINING_UNSCHEDULABLE
}
