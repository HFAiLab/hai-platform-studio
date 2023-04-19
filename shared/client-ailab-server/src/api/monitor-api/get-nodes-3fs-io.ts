import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 查询节点 3FS IO 的接口参数
 */
export type GetNodes3fsIoParams = AilabServerParams

/**
 * 查询节点 3FS IO 的接口返回结果
 */
export interface GetNodes3fsIoResult {
  [node: string]: Nodes3fsIoItem
}

/**
 * 查询节点 3FS IO 的接口配置
 */
export type GetNodes3fsIoApiConfig = AilabServerApiConfig<GetNodes3fsIoParams, GetNodes3fsIoResult>

/**
 * 节点 3FS IO 数据
 */
export interface Nodes3fsIoItem {
  read: number
  write: number
}
