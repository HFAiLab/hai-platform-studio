import { IOFrontierServer } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { EXPIRE_TIME, getUsageSeries } from '../../biz/custom-statistics'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { getConfigMixin } from '../mixin'

export const GetNodeUsageSeriesSubscribeHandlerInstance = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.NodeUsageSeries]>({
    ...getConfigMixin(io, SubscribeCommands.NodeUsageSeries),
    ioCommand: SubscribeCommands.NodeUsageSeries,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.NodeUsageSeries],
    interval: EXPIRE_TIME,
    async requestData(query: SubQueryParams[SubscribeCommands.NodeUsageSeries]) {
      const result = await getUsageSeries(query.type)
      return result
    },
  })
}
