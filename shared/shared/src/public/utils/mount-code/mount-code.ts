/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { MountCodeInfoMap } from '../../../common'

/**
 * 这里可以配置用户的额外挂载点信息，
 * 用于当用户通过 jupyter 侧边栏提交任务的时候，可以选择额外挂载点
 */
export const mountCodeInfoMap: MountCodeInfoMap = {}

export type MountInfo = Record<string, boolean>

/**
 * 获取默认的 MountInfo
 */
export const getDefaultMountInfo = (): MountInfo => {
  const mountInfo: MountInfo = {}

  for (const [key, value] of Object.entries(mountCodeInfoMap)) {
    mountInfo[key] = value.default
  }

  return mountInfo
}

/**
 * 转换成 mountCode 数字
 */
export const getMountCode = (mount_info: MountInfo): number => {
  let mount_code = 0

  for (const [key, value] of Object.entries(mount_info)) {
    if (value && key in mountCodeInfoMap) {
      mount_code |= mountCodeInfoMap[key]!.code
    }
  }

  return mount_code
}

/**
 * 转换成方便展示的 string
 */
export const mountInfoToFormatString = (mount_info: MountInfo): string => {
  const mountAlias = []

  for (const [key, value] of Object.entries(mount_info)) {
    if (value && key in mountCodeInfoMap) {
      mountAlias.push(mountCodeInfoMap[key]!.alias)
    }
  }

  return mountAlias.join(',')
}

/**
 * 根据一个数字转换成简易版本的当前挂载点信息
 */
export const getMountInfoFromCode = (mount_code: number): MountInfo => {
  const res: MountInfo = {}

  for (const [key, value] of Object.entries(mountCodeInfoMap)) {
    res[key] = (mount_code & value.code) !== 0
  }

  return res
}
