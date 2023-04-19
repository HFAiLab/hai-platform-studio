import type { CurrentTasksInfo } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams } from '../../types'

/**
 * 获取当前排队、调度任务状态等 的接口参数
 */
export interface CurrentTasksInfoParams extends AilabServerParams {
  force?: boolean
}

/**
 * 获取当前排队、调度任务状态等 的接口返回结果
 */
export type CurrentTasksInfoResult = CurrentTasksInfo

/**
 * 获取当前排队、调度任务状态等 的接口配置
 */
export type CurrentTasksInfoApiConfig = AilabServerApiConfig<
  CurrentTasksInfoParams,
  CurrentTasksInfoResult
>
