import type { MountInfo } from '@hai-platform/shared'
import type { IQueryType } from '../../../schemas/basic'
import type { ExperimentPanelMode } from './experiment'

export interface Exp2CreateParams {
  // 分组
  group: string
  // 节点
  worker: number
  // 优先级
  priority: number
  // 镜像
  image: string
  // 运行目录
  directory: string
  // whole_life_state
  whole_life_state: number
  // 额外挂载点
  mount_extra: MountInfo
  // 更多可选项 hf_env
  py_venv: string
  // 更多可选项 环境变量
  envs: Array<[string, string]>
  // 更多可选项，命令行参数
  parameters: Array<string>
  // 更多可选项 标签
  tags: Array<string>
  // 更多可选项 watchdog 定时
  watchdog_time: number
  // sidecar: 用于灰度挂载点等
  sidecar: string[]
  // fffs enable fuse
  fffs_enable_fuse: string
}

export interface IExp2StateByProps {
  queryType: IQueryType
  queryValue: string // chainId | nb_name
  mode: ExperimentPanelMode
}
