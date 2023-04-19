import type { TrainImageInfo, UserImageInfo } from '@hai-platform/shared'
import type { ApiServerApiConfig, ApiServerParams } from '../../types'

/*
 * 获取用户训练的请求参数：
 */
export type GetTrainImagesParams = ApiServerParams

/*
 * 获取用户训练的响应内容：
 */
export interface GetTrainImagesResult {
  mars_images: TrainImageInfo[]
  user_images: UserImageInfo[]
}

export type GetTrainImagesApiConfig = ApiServerApiConfig<GetTrainImagesParams, GetTrainImagesResult>
