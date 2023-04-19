import type { AilabServerApiConfig, AilabServerParams } from '../../types'

export type AboutMeInfoParams = AilabServerParams

/**
 * 获取个人信息 的接口返回结果
 */
export interface AboutMeInfoResult {
  userName: string
  sharedGroup: string
  avatar?: string
  accountCreateTime?: string
  // 预留该字段
  level?: string
}

/**
 * 获取个人信息 的接口配置
 */
export type AboutMeInfoApiConfig = AilabServerApiConfig<AilabServerParams, AboutMeInfoResult>
