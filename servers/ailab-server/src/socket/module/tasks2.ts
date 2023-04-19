import { IOFrontierServer } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { getTaskTypedOverview } from '../../biz/cluster-consumer'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { getConfigMixin } from '../mixin'

// hint: 这里提供一个 mock 错误的方式，可以参考：
// for mock error:
// let tasks_count = 0

export const GetTasksSubscribeHandlerInstance2 = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.TaskOverview2]>({
    ...getConfigMixin(io, SubscribeCommands.TaskOverview2),
    ioCommand: SubscribeCommands.TaskOverview2,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.TaskOverview2],
    async requestData(query: SubQueryParams[SubscribeCommands.TaskOverview2]) {
      try {
        const data = await getTaskTypedOverview(query.taskType)
        // for mock error:
        // tasks_count += 1
        // if (tasks_count > 7 && tasks_count < 12) {
        //   throw new Error('mock error')
        // }
        return data
      } catch (e) {
        this.fatalErrorHandler &&
          this.fatalErrorHandler(e as Error, {
            ioCommand: this.ioCommand,
            skipIoEmitFatal: true,
          })
        return null
      }
    },
    compareContentChange(originContents: any, contents: any): string[] {
      const originContent = originContents
      const content = contents

      if (!contents) {
        this.logger?.info('tasks originContents and contents are null')
        return []
      }

      const contentKeys = Object.keys(content)

      if (!originContents) {
        this.logger?.info(`tasks originContents is null and return ${contentKeys}`)
        return contentKeys
      }

      const changedKeys = []

      try {
        for (const key of contentKeys) {
          if (
            !(key in originContent) ||
            content[key].queued !== originContent[key].queued ||
            content[key].scheduled !== originContent[key].scheduled
          ) {
            changedKeys.push(key)
          }
        }
      } catch (e) {
        this.logger?.error('tasks compareContentChange error:', e)
        console.error(originContents, contents)
      }

      return changedKeys
    },
  })
}
