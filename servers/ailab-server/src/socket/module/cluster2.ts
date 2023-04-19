import { ApiServerApiName } from '@hai-platform/client-api-server'
import { IOFrontierServer } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { logger } from '../../base/logger'
import { getExternalClusterOverview } from '../../biz/cluster-consumer/externalClusterOverview'
import { GlobalConfig } from '../../config'
import { GlobalApiServerClient } from '../../req/apiServer'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { hrtime2ms } from '../../utils'
import { ioHistogram } from '../metrics'
import { getConfigMixin } from '../mixin'

export const GetClusterSubscribeHandlerInstance2 = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.ClusterOverview2]>({
    ...getConfigMixin(io, SubscribeCommands.ClusterOverview2),
    ioCommand: SubscribeCommands.ClusterOverview2,
    interval: 5000,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.ClusterOverview2],
    async requestData(query: SubQueryParams[SubscribeCommands.ClusterOverview2]) {
      try {
        if (query.taskType === 'external') {
          return await getExternalClusterOverview()
        }
        const startTime = process.hrtime() // 开始时间
        const data = await GlobalApiServerClient.request(
          ApiServerApiName.GET_CLUSTER_OVERVIEW_FOR_CLIENT,
          {
            token: GlobalConfig.BFF_ADMIN_TOKEN,
          },
          {
            baseURL: query.marsServerURL,
            headers: query.marsServerHost
              ? {
                  Host: query.marsServerHost,
                }
              : {},
          },
        )
        const dur = hrtime2ms(process.hrtime(startTime)) // 计算请求处理时间
        ioHistogram.observe({ path: '/get_cluster_overview_for_client_v2' }, dur)
        if (query.taskType === 'cpu') return data.cpu_detail
        return data.gpu_detail
      } catch (e) {
        logger.error('get cluster overview error:', e)
        this.fatalErrorHandler &&
          this.fatalErrorHandler(e as Error, {
            ioCommand: this.ioCommand,
            skipIoEmitFatal: true,
          })
        return null
      }
    },
  })
}
