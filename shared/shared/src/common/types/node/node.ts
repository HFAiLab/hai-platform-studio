import type { Task } from '../task'
import type { User } from '../user'
import type { NodeCurrentCategory, NodeScheduleZone, NodeStatus, NodeType } from './node-properties'

/**
 * 节点信息
 *
 */
export interface Node {
  /**
   * 节点名称
   *
   */
  name: string

  /**
   * 节点类型
   *
   */
  type: NodeType | null

  /**
   * 节点状态
   */
  status: NodeStatus

  /**
   * GPU 数量
   *
   * @example 8
   */
  gpu_num: number

  /**
   * 节点内存 bytes
   *
   * @example 496873336832
   */
  memory: number

  /**
   * CPU 核数
   *
   * @example 128
   */
  cpu: number

  /**
   * 调度 Group
   *
   */
  group: string | null

  /**
   * 节点所属 Group
   *
   */
  mars_group: string | null

  /**
   */
  origin_group: string | null

  /**
   * 所在集群
   *
   * @example 'jd'
   */
  cluster: string

  /**
   * 节点所在调度空间
   *
   */
  schedule_zone: NodeScheduleZone | null

  /**
   * 内网 IP
   */
  internal_ip: string

  /**
   * Leaf 名称
   *
   * @example 'L18/U1'
   */
  leaf: string | null

  /**
   * Spine 名称
   *
   * @example 'S09/U1'
   */
  spine: string | null

  /**
   * 节点分配的用途
   *
   */
  use: string | null

  /**
   * 工作中的任务类型
   *
   */
  working: Task['task_type'] | null

  /**
   * 工作中的用户
   *
   */
  working_user: User['user_name'] | null

  /**
   * 工作中的用户角色
   *
   */
  working_user_role: User['role'] | null

  /**
   * 节点当前类别
   */
  current_category: NodeCurrentCategory

  /**
   * 后端计算时使用的数值
   *
   * @deprecated - 前端不需要使用
   */
  nodes: number

  /**
   * 以下为 9-26 新增
   */

  /**
   * 瞬时 GPU 温度 (`C)
   */
  gpu_temperature: number

  /**
   * 瞬时 GPU 使用率
   */
  gpu_util: number

  /**
   * 瞬时 GPU 功率
   */
  gpu_power: number

  /**
   * 瞬时显存
   */
  gpu_mem: number

  /**
   * 瞬时 IB RX
   */
  ib_rx: number

  /**
   * 瞬时 IB TX
   */
  ib_tx: number

  /**
   * 当前节点正在运行的任务 ID
   */
  working_task_id: number | null

  /**
   * 瞬时 3fs 读流量
   */
  fffs_read: number

  /**
   * 瞬时 3fs 写流量
   */
  fffs_write: number

  /**
   * 瞬时 cpu 3fs 读流量
   */
  cpu_fffs_read: number

  /**
   * 瞬时 cpu 3fs 写流量
   */
  cpu_fffs_write: number
}
