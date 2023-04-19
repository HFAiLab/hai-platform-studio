import type { ApiServerClient, GetTrainImagesResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { makeListFromClusterDF } from '@hai-platform/shared'
import type { IHaiEnvList } from '../schema'
import { AsyncServiceNames } from '../schema'

const TrainImagesCache = {
  token: '',
  time: 0,
  value: null as null | GetTrainImagesResult,
}
const TRAIN_IMAGE_CACHE_TIME = 30 * 1000

const HaiEnvCache = {
  token: '',
  time: 0,
  value: null as null | IHaiEnvList,
}
const HAI_ENV_LIST_CACHE_TIME = 30 * 1000

// 这个类里面应该都是静态的 static 方法
export class ClusterHelper {
  static async getClusterUsage(options: { apiServerClient: ApiServerClient }) {
    const clusterDF = await options.apiServerClient.request(ApiServerApiName.CLUSTER_DF, {
      monitor: false,
    })
    const clusterUsage = makeListFromClusterDF(clusterDF.cluster_df, {
      ifInnerUser: window._hf_user_if_in,
    })
    return clusterUsage
  }

  static async getTrainImages(options: { apiServerClient: ApiServerClient; token: string }) {
    if (
      TrainImagesCache.token === options.token &&
      Date.now() - TrainImagesCache.time < TRAIN_IMAGE_CACHE_TIME &&
      TrainImagesCache.value !== null
    ) {
      return TrainImagesCache.value
    }
    const ret = await options.apiServerClient.request(ApiServerApiName.GET_TRAIN_IMAGES)
    TrainImagesCache.token = options.token
    TrainImagesCache.time = Date.now()
    TrainImagesCache.value = ret
    return ret
  }

  static async fetchHaiEvnList(options: {
    invokeAsyncService: (key: AsyncServiceNames.getHaiEnvList, params: null) => Promise<IHaiEnvList>
    token: string
  }) {
    if (
      HaiEnvCache.token === options.token &&
      Date.now() - HaiEnvCache.time < HAI_ENV_LIST_CACHE_TIME &&
      HaiEnvCache.value !== null
    ) {
      return HaiEnvCache.value
    }
    const ret = await options.invokeAsyncService(AsyncServiceNames.getHaiEnvList, null)
    HaiEnvCache.token = options.token
    HaiEnvCache.time = Date.now()
    HaiEnvCache.value = ret
    return ret
  }
}
