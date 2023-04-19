import {
  IOFrontierServer,
  compareContentChangeDefaultImpl,
} from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { ServiceTasksIOResult } from '@hai-platform/studio-schemas'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { getConfigMixin } from '../mixin'
import { RUserTaskRequester } from '../service/userTask'

export const GetServiceTasksSubscribeHandlerInstance = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.ServiceTasks]>({
    ...getConfigMixin(io, SubscribeCommands.ServiceTasks),
    ioCommand: SubscribeCommands.ServiceTasks,
    interval: 3000,
    cacheType: 'memory',
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.ServiceTasks],
    async requestData(query: SubQueryParams[SubscribeCommands.ServiceTasks]) {
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
        const serviceRes = await RUserTaskRequester.rGetServiceTasks({
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
        return serviceRes
      } catch (e: any) {
        if (`${e}`.includes('没有符合条件的任务')) {
          return null
        }
        if (!e.response || e.response.status !== 401) {
          // 当没有这个文件的时候返回 401，这个时候是正常的，update: 接入 shared 之后，实际上目前已经没有这种报错了，后面可以删掉
          logger.error('IOFrontierServer serviceTask request Data not 401:', e, 'and query:', query)
        }
        return null
      }
    },
    compareContentChange(
      originContents: ServiceTasksIOResult,
      contents: ServiceTasksIOResult,
      keys: string[] | string,
    ): string[] {
      if (!contents || !contents.tasks) {
        return []
      }
      if (!originContents || !originContents.tasks) {
        this.logger?.info('tasks originContents and contents are null')
        return ['queue_status']
      }
      if (!originContents.tasks) {
        return ['queue_status']
      }
      const changeKeys = compareContentChangeDefaultImpl(originContents.tasks, contents.tasks, keys)
      return changeKeys
    },
  })
}
