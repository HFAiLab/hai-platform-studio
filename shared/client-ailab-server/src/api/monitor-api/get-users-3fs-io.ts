import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 查询用户 3FS IO 的接口参数
 */
export type GetUsers3fsIoParams = AilabServerParams

/**
 * 查询用户 3FS IO 的接口返回结果
 */
export interface GetUsers3fsIoResult {
  [username: string]: Users3fsIoItem
}

/**
 * 查询用户 3FS IO 的接口配置
 */
export type GetUsers3fsIoApiConfig = AilabServerApiConfig<GetUsers3fsIoParams, GetUsers3fsIoResult>

/**
 * 用户 3FS IO 数据
 */
export interface Users3fsIoItem {
  read: number
  write: number
}
