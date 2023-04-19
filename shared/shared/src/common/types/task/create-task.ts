import type { ContainerServicePortType } from './service'

/**
 * 【仅开发容器】创建开发容器传递的单个 service schema
 */
export interface CreateTaskService {
  name: string

  port?: number

  type?: ContainerServicePortType

  startup_script?: string
}

/**
 * 创建实验的最新版本请求参数（写到 body 里面）
 */
export interface CreateTaskV2Schema {
  /**
   * 实验名称
   */
  name: string

  /**
   * 版本固定是 2
   */
  version: 2

  /**
   * 提交实验的优先级
   */
  priority: number

  resource: {
    /**
     * 可选，不指定，默认 default，通过 hfai 上传的 image，或者集群内建的 template
     */
    image?: string

    /**
     * 提交实验所在的组
     */
    group: string

    /**
     * 实验申请节点数
     */
    node_count: number
  }

  spec: {
    /**
     * 代码的绝对路径，具体到 py 文件
     */
    entrypoint: string

    /**
     * 代码工作目录的绝对路径
     */
    workspace: string

    /**
     * 命令行参数
     */
    parameters?: string

    /**
     * 环境变量
     */
    environments?: Record<string, string | number>
  }

  options?: {
    /**
     * 初始的 whole_life_state
     */
    whole_life_state: number

    /**
     * 挂载文件相关可选项
     */
    mount_code?: number

    /**
     * py_venv 相关可选项
     */
    py_venv?: string

    /**
     * watchdog 时间
     */
    watchdog_time?: number

    /**
     * 选配的 sidecar
     */
    sidecar: string | string[]
  }

  /**
   * 训练也可以指定 service
   */
  services?: CreateTaskService[]
}

/**
 * 创建实验的最新版本请求参数（写到 body 里面）
 */
export interface ServiceTaskCreateV2Schema {
  /**
   * 实验名称
   */
  name: string

  /**
   * 版本固定是 2
   */
  version: 2

  /**
   * 写死
   */
  task_type: 'jupyter'

  resource: {
    /**
     * 可选，不指定，默认 default，通过 hfai 上传的 image，或者集群内建的 template
     */
    image: string

    /**
     * 提交实验所在的组
     */
    group: string

    /**
     * 【仅开发容器】申请共享开发容器的时候，需要传递这个字段
     */
    cpu?: number

    /**
     * 【仅开发容器】申请共享开发容器的时候，需要传递这个字段
     */
    memory?: number

    /**
     * 【仅开发容器】是否是 spot 类型的开发容器
     */
    is_spot?: boolean
  }

  options?: {
    /**
     * 挂载文件相关可选项
     */
    mount_code?: number

    /**
     * sidecar 配置
     */
    sidecar: string[]
  }

  services: CreateTaskService[]
}
