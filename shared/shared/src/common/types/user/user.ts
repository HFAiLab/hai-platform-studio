import type { UserRole } from './user-properties'
/**
 * 创建用户请求参数（写到 body 里面）
 */
export interface CreateUserSchema {
  /**
   * 用户名
   */
  user_name: string
  /**
   * 用户隶属的分组
   */
  shared_group: string
  /**
   * 用户 ID 可选，不传时自动生成
   */
  user_id?: number
  /**
   * 用户角色，内部 / 外部用户，可选，默认为内部
   */
  role?: UserRole
  /**
   * 昵称，可填写用户中文名，可选
   */
  nick_name?: string
  /**
   * 用户是否激活，默认激活
   */
  active?: boolean
}

/**
 * 用户信息
 *
 */
export interface User {
  /**
   * 用户 ID
   */
  user_id: number

  /**
   * 用户名
   */
  user_name: string

  /**
   * 用户角色
   */
  role: UserRole

  /**
   * 是否活跃
   */
  active: boolean

  /**
   * 共享组名
   */
  shared_group: string

  /**
   * 用户昵称
   */
  nick_name: string

  /**
   * 用户组
   */
  user_groups: string[]
}

/**
 * GET_USER 获取到的信息和 GET_USERS 并不一样，所以这里额外声明一下
 */
export interface SingleUserInfo {
  user_name: string

  /**
   * 当前 token 可以访问哪些内容
   */
  access_scope: string

  token: string

  shared_group: string

  /**
   * 等同 shared_group
   */
  user_shared_group: string

  /**
   * 用户组
   */
  group_list: string[]

  /*
   * 等同 group_list
   */
  user_group: string[]

  /**
   * 用户角色
   */
  role: UserRole

  /**
   * 用户昵称
   */
  nick_name: string
}

export interface ExternalUserAccount {
  email: string
  yinghuo_account_opened: boolean
  yinghuo_username: string
  yinghuo_group: string
  yinghuo_token: string
  vpn_account: string
  vpn_password: string
  email_sent: boolean
  email_received: boolean
  status: string
  account_type: string
  form_type: string
  wechat_status: string
  tags: string[]
  notes: string
  hidden: boolean
}

export interface ExternalUserInfo {
  chinese_name: string
  organization_type: string
  school: string
  company: string
  researcher_role: string
  researcher_title: string
  worker_position: string
  mentor: string
  teacher_title: string
  worker_dep: string
  subject: string
  application: string
  desc: string
  previous_gpu: string
  estimate_gpu: string
  dataset_types: string
  public_datasets: string
  email: string
  contact: string
  wechat_name: string
  upload_time: string
  invitation_code: string
}

export interface AccessTokenFullInfo {
  access_token: string
  /**
   * 权限 scope
   */
  access_scope: 'all' | 'except_jupyter'
  /**
   * 这个 token 可以用来访问谁的信息
   */
  access_user_name: string
  /**
   * 由谁创建，原始所有者或者管理员
   */
  created_by: string
  /**
   * 当前这个 token 是否活跃
   */
  active: boolean
  /**
   * 创建时间
   */
  created_at: string
  /**
   * 由谁删除的
   */
  deleted_by: string | null
  /**
   * 这个 token 授权给谁
   */
  from_user_name: string
  /**
   * 过期时间
   */
  expire_at: string
  /**
   * 更新时间，一般没用
   */
  updated_at: string
}
