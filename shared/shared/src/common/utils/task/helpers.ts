import type { Task } from '../../types'
import { TaskChainStatus, TaskQueueStatus } from '../../types'

/**
 * ChainStatus 是前端的一个合成状态，虽然在部分请求中后端也返回了这个字段
 */
export const computeChainStatus = (task: Task): TaskChainStatus => {
  if (task.queue_status === TaskQueueStatus.FINISHED) {
    return TaskChainStatus.FINISHED
  }
  if (task.queue_status === TaskQueueStatus.SCHEDULED) {
    return TaskChainStatus.RUNNING
  }
  // 如果是第一个并且在排队，特殊处理：
  if (!task.id_list || task.id_list.length <= 1) {
    return TaskChainStatus.WAITING_INIT
  }
  return TaskChainStatus.SUSPENDED
}
