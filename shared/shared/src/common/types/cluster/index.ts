export interface ClusterUnit {
  /**
   * 机房，例如 jd
   */
  cluster: string

  /**
   * 有多少 cpu，例如 128
   */
  cpu: number

  /**
   * 当前用途，例如 training
   */
  current_category: string

  /**
   * 有多少 gpu，例如 8
   */
  gpu_num: number

  /*
   * 可以用于快捷访问的整合过的 group
   */
  group: string
  // updated: delete group0、group1、group2、is_locked

  /**
   * 内部 ip，一般 10 开头
   */
  internal_ip: string
  is_working: boolean

  /**
   * 机器的 Leaf 信息，例如 'L13/U1'
   */
  leaf: string

  /**
   * 通过点分割的 group 字符串
   * 但是需要注意并不是所有的节点都有 mars_group 这个属性，k8s master 节点一般没有
   */
  mars_group?: string

  /**
   * 内存，一个比较大的数字
   */
  memory: number

  /**
   * 机器名称
   */
  name: string
  nodes: number

  /**
   * 有可能是空字符串
   */
  origin_group: string
  roles: string
  room: string
  schedule_zone: string
  spine: string

  /**
   * 状态，比如是 Ready，后面可以做成枚举
   */
  status: string

  /*
   * cpu 或者 gpu
   */
  type: 'gpu' | 'cpu'
  use: string
  working: string

  /*
   * 当前使用的用户
   */
  working_user: string
  working_user_role: string

  /**
   * 新增的一些性能信息
   */
  ib_rx: number
  ib_tx: number
  gpu_util: number
  gpu_power: number

  /**
   * 当前集群运行任务的信息，任务运行的时候才有
   */
  working_task_id?: number
  working_task_rank?: number
}

export interface IClusterInfoUsage {
  show: string
  group: string
  total: number
  free: number
  isLeaf: boolean
}
