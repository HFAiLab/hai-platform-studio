import { IOFrontierServer } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { getTaskCurrentPerf2 } from '../../biz/taskCurrentPerf'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { getConfigMixin } from '../mixin'

export const GetTaskCurrentPerf2SubscribeHandlerInstance = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.TaskCurrentPerf2]>({
    ...getConfigMixin(io, SubscribeCommands.TaskCurrentPerf2),
    ioCommand: SubscribeCommands.TaskCurrentPerf2,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.TaskCurrentPerf2],
    interval: 15000,
    async requestData(query: SubQueryParams[SubscribeCommands.TaskCurrentPerf2]) {
      const result = await getTaskCurrentPerf2(query)
      return {
        perfs: result,
      }
    },
  })
}
