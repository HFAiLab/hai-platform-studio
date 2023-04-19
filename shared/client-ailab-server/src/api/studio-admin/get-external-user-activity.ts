// 比起 api-server 端的类似接口，此接口会加入中文用户名映射，以及私有数据集统计，发帖数统计
// api-server 端的接口使用 activeness，此接口使用 activity 来做区分

// GetExternalUserActivity

import type { ExternalUserActivenessItem } from '@hai-platform/shared'
import type { AilabServerApiConfig, AilabServerParams, NanoDatasetMeta } from '../../types'

type ExtendedProps = {
  user_name: string
  chinese_name: string | null
  private_datasets?: NanoDatasetMeta[]
  xtopic_post_count: number
  yinghuo_account_create_time: string | null
}

export type GetExternalUserActivityParams = AilabServerParams

export type GetExternalUserActivityResult = Array<ExternalUserActivenessItem & ExtendedProps>

export type GetExternalUserActivityConfig = AilabServerApiConfig<
  GetExternalUserActivityParams,
  GetExternalUserActivityResult
>
