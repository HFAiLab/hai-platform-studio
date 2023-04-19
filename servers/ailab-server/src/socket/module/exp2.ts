import type { GetUserTaskResult } from '@hai-platform/client-api-server'
import {
  IOFrontierServer,
  compareContentChangeDefaultImpl,
} from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { getConfigMixin } from '../mixin'
import { RUserTaskRequester } from '../service/userTask'

export const GetExpSubscribeHandlerInstance2 = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.Experiment2]>({
    ...getConfigMixin(io, SubscribeCommands.Experiment2),
    ioCommand: SubscribeCommands.Experiment2,
    interval: 3000,
    cacheType: 'memory',
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.Experiment2],
    async requestData(query: SubQueryParams[SubscribeCommands.Experiment2]) {
      try {
        if (!query.token) {
          throw new Error('userName not found')
        }
        const userName = (
          await getUserInfo(query.token, {
            'x-custom-host': query.marsServerHost,
            'x-custom-mars-server': query.marsServerURL,
          })
        )?.user_name
        if (!userName) {
          throw new Error('userName not found')
        }
        const chainTask = await RUserTaskRequester.rGetTask({
          params: query,
          marsServerConfig:
            query.marsServerHost && query.marsServerURL
              ? {
                  marsServerURL: query.marsServerURL,
                  marsServerHost: query.marsServerHost,
                }
              : undefined,
          userName,
        })
        // 这里的格式要稍微注意下
        return { task: chainTask }
      } catch (e: any) {
        if (`${e}`.includes('没有符合条件的任务')) {
          return null
        }
        if (!e.response || e.response.status !== 401) {
          // 当没有这个文件的时候返回 401，这个时候是正常的，update: 接入 shared 之后，实际上目前已经没有这种报错了，后面可以删掉
          logger.error('IOFrontierServer Experiment2 request Data not 401:', e, 'and query:', query)
        }
        return null
      }
    },
    compareContentChange(
      originContents: GetUserTaskResult,
      contents: GetUserTaskResult,
      keys: string[] | string,
    ): string[] {
      if (!contents || !contents.task) {
        return []
      }
      if (!originContents || !originContents.task) {
        this.logger?.info('tasks originContents and contents are null')
        return ['queue_status']
      }
      if (!originContents.task) {
        return ['queue_status']
      }
      const changeKeys = compareContentChangeDefaultImpl(originContents.task, contents.task, keys)
      return changeKeys
    },
  })
}
