import type { GetTrainImagesResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { i18n, i18nKeys } from '@hai-platform/i18n'
import type { ClusterUnit, IClusterInfoUsage } from '@hai-platform/shared'
import { makeListFromClusterDF } from '@hai-platform/shared'
import type { ErrorHandler } from '@hai-platform/studio-pages/lib/utils/errorHandler'

import {
  clear,
  save,
  setNodeMeta,
} from '@hai-platform/studio-toolkit/lib/esm/utils/nodeNetworkMetaMap'
import { GlobalApiServerClient } from '../../api/apiServer'
import { CONSTS } from '../../consts'

const failedList = [
  {
    show: i18n.t(i18nKeys.biz_clusterInfo_failed),
    group: CONSTS.INVALID_GROUP,
    total: 0,
    free: 0,
    isLeaf: true,
  },
]

const loadingList = [
  { show: 'Loading...', group: CONSTS.INVALID_GROUP, total: 0, free: 0, isLeaf: true },
]

export class ClusterInfo {
  constructor(errorHandler?: ErrorHandler) {
    this.usage = loadingList
    this.env = []
    this._errorHandler = errorHandler
    this.trainImages = {
      mars_images: [],
      user_images: [],
    }
  }

  async getFromRemote() {
    let clusterInfo
    try {
      this.usage = loadingList
      const [resClusterInfo, resTrainImages] = await Promise.all([
        GlobalApiServerClient.request(ApiServerApiName.CLUSTER_DF, {
          monitor: false,
        }),
        GlobalApiServerClient.request(ApiServerApiName.GET_TRAIN_IMAGES),
      ])
      clusterInfo = resClusterInfo
      this.trainImages = resTrainImages
    } catch (e) {
      this._errorHandler &&
        this._errorHandler.handleFetchError(e, i18n.t(i18nKeys.biz_clusterInfo_failed))
      this.usage = failedList
      return this
    }

    try {
      this.usage = makeListFromClusterDF(clusterInfo.cluster_df, {
        ifInnerUser: window._hf_user_if_in,
      })
      this.env = clusterInfo.containers
      this.updateNetworkMeta(clusterInfo.cluster_df)
    } catch (e) {
      this.usage = failedList
      this._errorHandler &&
        this._errorHandler.handleError(i18n.t(i18nKeys.biz_clusterInfo_calc_failed))
      return this
    }
    return this
  }

  get() {
    return this
  }

  updateNetworkMeta(df: Array<ClusterUnit>): void {
    clear()
    for (const node of df) {
      const leaf = node.leaf ?? null
      const spine = node.spine ?? null
      const scheduleZone = node.schedule_zone ?? null
      setNodeMeta(node.name, leaf, spine, scheduleZone)
    }
    save()
    // HINT: 为了解决拿到集群信息之前渲染留白问题，使用了 localStorage 存储之前的映射结果。
    // 发更新通知重新渲染这种做法需要做的改动有点大
  }

  trainImages: GetTrainImagesResult

  usage: IClusterInfoUsage[]

  env: Array<string>

  _errorHandler?: ErrorHandler
}

export const GlobalClusterInfoInstance = new ClusterInfo()
