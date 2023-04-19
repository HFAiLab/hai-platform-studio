import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取配置文本 的接口参数
 */
export type GetConfigTextParams = AilabServerParams

/**
 * 获取配置文本 的接口返回结果
 */
export type GetConfigTextResult = string

/**
 * 获取配置文本 的接口配置
 */
export type GetConfigTextApiConfig = AilabServerApiConfig<GetConfigTextParams, GetConfigTextResult>
