import { ApiServerApiName } from '@hai-platform/client-api-server'
import { IOFrontierServer } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { GlobalApiServerClient } from '../../req/apiServer'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { hrtime2ms } from '../../utils'
import { ioHistogram } from '../metrics'
import { getConfigMixin } from '../mixin'

export const GetSysLogSubscribeHandlerInstance = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new IOFrontierServer<SubQueryParams[SubscribeCommands.SysLog]>({
    ...getConfigMixin(io, SubscribeCommands.SysLog),
    ioCommand: SubscribeCommands.SysLog,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.SysLog],
    interval: 5000,
    async requestData(query: SubQueryParams[SubscribeCommands.SysLog]) {
      const params = {
        token: query.token,
        chain_id: query.chainId,
      }
      this.logger?.info(`socket syslog, params: ${JSON.stringify(params)}`)
      try {
        const startTime = process.hrtime() // 开始时间
        const res = await GlobalApiServerClient.request(ApiServerApiName.GET_TASK_SYS_LOG, params, {
          baseURL: query.marsServerURL,
          headers: query.marsServerHost
            ? {
                Host: query.marsServerHost,
              }
            : {},
        })
        const dur = hrtime2ms(process.hrtime(startTime)) // 计算请求处理时间
        ioHistogram.observe({ path: '/get_task_sys_log' }, dur)
        return {
          success: 1,
          data: res.data,
        }
      } catch (e) {
        this.logger?.info(`syslog requestData error: ${e}`)
        return {
          success: 0,
          msg: e ? String(e) : 'request syslog catch err:unknown',
        }
      }
    },
  })
}
