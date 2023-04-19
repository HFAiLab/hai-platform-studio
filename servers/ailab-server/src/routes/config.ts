/**
 * 用于配置所有的路由和他们的权限，可以理解为一种兜底和隔离策略
 * 例如 internal-platform 配置了 developer，那么不是 developer 的人即使知道了这个接口，也 403
 *
 * 我们默认会加载下述所有目录所有的路由文件，然后根据目录来做权限划分。
 * 命名规则：开发过程中，文件夹名建议短横线命名，文件名建议小驼峰命名。
 * 在实际路由转换中，会把短横线转换成下划线。
 */

import { AdminGroup, UserRole } from '@hai-platform/shared'

export const RouteRegisterConfig = [
  {
    dir: 'internal-platform',
    auth: ['developer'],
  },
  {
    dir: 'trainings',
    auth: [UserRole.INTERNAL, UserRole.EXTERNAL],
  },
  {
    dir: 'studio-admin',
    auth: ['developer', AdminGroup.ROOT], // 基本校验，剩下的在 route，里做 developer 或 root
  },
  {
    dir: 'xtopic',
    auth: [UserRole.INTERNAL, UserRole.EXTERNAL],
  },
  {
    dir: 'report',
    auth: false,
  },
  {
    dir: 'login', // 登录相关的接口，因为这个可能是统一管理的，不算 trainings
    auth: false,
  },
  {
    dir: 'file-download', // 文件下载用，通常是 a 标签加 GET，适合手动处理鉴权
    auth: false,
  },
  {
    dir: 'tools', // 一些简单的工具函数，无需鉴权
    auth: false,
  },
  {
    dir: 'agg-fetion', // 上报聚合函数，目前无需鉴权
    auth: false,
  },
  {
    dir: 'hai', // 上报聚合函数，目前无需鉴权
    auth: false,
  },
]
