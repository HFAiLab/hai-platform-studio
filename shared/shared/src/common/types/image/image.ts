export interface TrainImageInfoConfig {
  cuda: string
  python: string
  hf_envs: string[]
  environments: Record<string, string>
}

// 内置的镜像
export interface TrainImageInfo {
  env_name: string
  image: string
  schema_template: string
  config: TrainImageInfoConfig
  quota: string
}

// 用户自定义的镜像
export interface UserImageInfo {
  image_tar: string
  image: string
  path: string
  shared_group: string
  registry: string
  status: string
  task_id: number
  created_at: string
  updated_at: string
}
