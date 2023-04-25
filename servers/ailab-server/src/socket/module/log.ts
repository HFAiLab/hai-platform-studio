/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Log 不去读写 redis，该请求的 last_seen 在多客户端场景下比较难以控制，且单次读写数据量大。
 */
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { GetTaskLogResult, TaskLogRestartLogMap } from '@hai-platform/client-api-server'
import type { SubMeta } from '@hai-platform/io-frontier/lib/cjs/schema'
import { SubOP } from '@hai-platform/io-frontier/lib/cjs/schema'
import type { QueryIdInfo } from '@hai-platform/io-frontier/lib/cjs/server/index'
import { IOFrontierServer, MetricOP } from '@hai-platform/io-frontier/lib/cjs/server/index'
import type { ExtendedTask } from '@hai-platform/shared'
import { computeChainStatus } from '@hai-platform/shared'
import stringifyInOrder from 'fst-stable-stringify'
import type { Server, Socket } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { getUserInfo } from '../../base/auth'
import { Timer } from '../../base/timer'
import { GlobalApiServerClient } from '../../req/apiServer'
import type { SubPayloadContents, SubQueryParams } from '../../schema/index'
import { LogErrors, SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import { compareObjectLevel1 } from '../../utils'
import { getConfigMixin } from '../mixin'
import { RUserTaskRequester } from '../service/userTask'

export interface ILogState {
  chain: ExtendedTask | null
  fullLog: string
  lastSeen: Object | null
  error_msg: string
  restart_log: TaskLogRestartLogMap | undefined
}
export interface LogQueryIdInfo extends QueryIdInfo {
  state: ILogState
}

const newEmptyState = () => {
  return {
    chain: null,
    fullLog: '',
    lastSeen: null,
    error_msg: '',
    restart_log: undefined,
  }
}

class LogServer extends IOFrontierServer<SubQueryParams[SubscribeCommands.Log]> {
  override queryIdInfoMap = new Map<string, LogQueryIdInfo>()

  // Log 因为数据量大且相对独立，每次更新不写入 redis。getNextData 中去掉 Redis cache 部分
  protected override async getNextData(
    _queryId: string,
    query: SubQueryParams[SubscribeCommands.Log],
    expireData?: boolean,
  ) {
    const nextData = await this.requestData_LOG(query, expireData)
    return nextData
  }

  protected getLastState(query: SubQueryParams[SubscribeCommands.Log]) {
    const queryId = this.schemaGenerator.genQueryId(this.ioCommand, query)
    const LastState = this.queryIdInfoMap.get(queryId)?.state
    return LastState ?? null
  }

  protected override remoteUnSubscribe(queryId: string, socketId: string) {
    super.remoteUnSubscribe(queryId, socketId)
    if (!this.getKeyInRooms(queryId)) {
      this.unlockUpdate(queryId)
    }
  }

  protected override async expireDataImpl(query: SubQueryParams[SubscribeCommands.Log]) {
    const queryId = this.schemaGenerator.genQueryId(this.ioCommand, query)
    await this.updateData_log(queryId, query, true)
  }

  private compareContentChange_LOG(
    prevState: ILogState,
    currentData: SubPayloadContents[SubscribeCommands.Log],
  ) {
    let chainChanged = false
    let logChanged = false
    let restartLogChanged = false

    // 比较 chain 的变更，currentData 里的 chain 不为空
    if (prevState.chain === null) {
      chainChanged = true
    } else {
      const oldChain = prevState.chain
      const newChain = currentData.chain!
      if (
        oldChain.chain_id !== newChain.chain_id ||
        computeChainStatus(oldChain) !== computeChainStatus(newChain)
      ) {
        chainChanged = true
      }
    }

    // log 变更
    if (
      !compareObjectLevel1(prevState.lastSeen, currentData.last_seen) ||
      currentData.fullLog ||
      prevState.error_msg !== currentData.error_msg
    ) {
      logChanged = true
    }

    if (currentData.restart_log) {
      if (!prevState.restart_log) restartLogChanged = true
      else {
        restartLogChanged =
          stringifyInOrder(prevState.restart_log) !== stringifyInOrder(currentData.restart_log)
      }
    }

    const ret = []
    if (chainChanged) ret.push('chain')
    if (logChanged) ret.push('log')
    if (restartLogChanged) ret.push('restartLog')
    return ret
  }

  private async updateData_log(
    queryId: string,
    query: SubQueryParams[SubscribeCommands.Log],
    expireData?: boolean,
  ) {
    const successAndShouldUnlock = this.lockUpdate(queryId)

    if (!successAndShouldUnlock) {
      return
    }

    try {
      const intervalIdBeforeRequest = this.queryIdInfoMap.get(queryId)?.intervalId
      const data = await this.getNextData(queryId, query, expireData)
      if (!this.queryIdInfoMap.has(queryId)) {
        this.logger.warn("[updateData_log] no queryId's info in queryIdInfoMap after getNextData")
        return
      }

      const intervalIdAfterRequest = this.queryIdInfoMap.get(queryId)?.intervalId

      if (intervalIdBeforeRequest !== intervalIdAfterRequest) {
        // hint: 这里如果不 return，客户端的日志就可能重复
        return
      }

      // Hint: 返回 null 说明 chain 当前为 finished，无需更新
      if (data === null) {
        return
      }

      // 失败的话，在这里通知前端
      if (data.success !== 1) {
        this.io?.to(queryId).emit(this.ioCommand, {
          payload: {
            content: data,
            changedKeys: [],
            query,
          },
        })
        return
      }

      // 同时比较 log 和 chain 的变动
      const changedKeys = this.compareContentChange_LOG(
        this.queryIdInfoMap.get(queryId)!.state,
        data,
      )

      if (changedKeys.length || expireData) {
        // this.logger.info('log changed and begin emit');
        const currentKeyInfo = this.queryIdInfoMap.get(queryId)!
        const retHasFullLog = typeof data.fullLog === 'string'
        if (retHasFullLog) {
          currentKeyInfo.state.fullLog = data.fullLog!
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          data.data && (currentKeyInfo.state.fullLog += data.data)
        }
        currentKeyInfo.content = data
        currentKeyInfo.state.lastSeen = data.last_seen ?? null
        currentKeyInfo.state.error_msg = data.error_msg ?? ''
        currentKeyInfo.state.chain = data.chain ?? null
        this.queryIdInfoMap.set(queryId, currentKeyInfo)

        // 以 path 方式监听时，如果 chain 改变，ret 会包含 fullLog
        const cont = {
          ...data,
          fullLog: expireData || retHasFullLog ? currentKeyInfo.state.fullLog : undefined,
        }
        this.io?.to(queryId).emit(this.ioCommand, {
          payload: {
            content: cont,
            changedKeys,
            query,
          },
        })
      }
    } catch (e) {
      this.logger.error(`${this.ioCommand} subscribe error`, e)
    } finally {
      if (successAndShouldUnlock) this.unlockUpdate(queryId)
    }
  }

  protected override async remoteSubscribe(
    queryId: string,
    query: SubQueryParams[SubscribeCommands.Log],
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) {
    this.logger.info('[frontier][log] begin remoteSubscribe')
    const socketId = socket.id

    this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.intervalAdd)

    this.queryIdInfoMap.set(queryId, {
      content: null,
      socketIds: new Set([socketId]),
      intervalId: -1 as any,
      state: newEmptyState(),
    })

    const data = await this.requestData_LOG(query)

    this.logger.info('[frontier] begin emit', this.ioCommand)
    this.io?.to(queryId).emit(this.ioCommand, {
      payload: {
        content: { ...data },
        changedKeys: [],
        query,
      },
    })

    // hint: 因为这个过程是异步，有可能这个执行的时候，已经调用了 unsub 了。
    if (!this.queryIdInfoMap.has(queryId)) {
      this.logger.warn(
        `[frontier][log] already delete queryInfo during requestData, queryId: ${queryId}`,
      )
      return
    }

    const queryIdInfo = this.queryIdInfoMap.get(queryId)!

    if ((queryIdInfo.intervalId as unknown as number) !== -1) {
      // 这里可能产生一个问题，用户 订阅 -> 取消订阅 -> 订阅，这个时候第一次的 intervalId 回来了，顺利通过了 this.queryIdInfoMap.has(queryId)
      // 这个时候会产生一个 interval 的泄漏
      // Hint: 由于这个是同一个 queryId 的，我感觉直接删除就行了
      this.logger.warn(
        `[frontier][log] queryIdInfo.intervalId is ${queryIdInfo.intervalId} not -1, attention and just clear it`,
      )
      Timer.clearInterval(queryIdInfo.intervalId)
    }

    // 设 interval id 还是在 request 执行完之后更安全
    const intervalId = Timer.setInterval(
      async () => {
        await this.updateData_log(queryId, query)
      },
      this.SUB_INTERVAL,
      `Socket:${this.ioCommand}`,
    )

    queryIdInfo.intervalId = intervalId
    queryIdInfo.content = data
    queryIdInfo.state.chain = data!.chain ?? null
    queryIdInfo.state.fullLog = data!.fullLog ?? ''
    queryIdInfo.state.lastSeen = data!.last_seen ?? null
    queryIdInfo.state.restart_log = data!.restart_log ?? undefined

    this.queryIdInfoMap.set(queryId, queryIdInfo)
  }

  public override register(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) {
    this.logger.info(`[frontier] register, command: ${this.ioCommand}, socketId: ${socket.id}`)
    this.io = io

    socket.on(this.ioCommand, (meta: SubMeta<SubQueryParams[SubscribeCommands.Log]>) => {
      const { query } = meta
      const queryId = this.schemaGenerator.genQueryId(this.ioCommand, query)

      if (meta.op === SubOP.sub) {
        this.logger.info(`[frontier] sub ${socket.id} query: ${queryId}`)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.metricReport && this.metricReport(queryId, this.ioCommand, MetricOP.sub)
        socket.join(queryId)

        // let allSockets = await io.in(queryId).allSockets();
        // console.log(`all socket in queryId ${queryId}:`, allSockets.size, allSockets)
        if (this.getKeyInRooms(queryId)) {
          const keyInfo = this.queryIdInfoMap.get(queryId)!

          // 第一次发送全量 LOG，有 fullLog 字段
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          keyInfo.content &&
            socket.emit(this.ioCommand, {
              payload: {
                content: {
                  ...keyInfo.content,
                  fullLog: keyInfo.state.fullLog,
                  data: undefined,
                },
                query,
              },
              changedKeys: [],
            }) // 如果暂时没有的话，等第一次生成的时候会广播一次
          keyInfo.socketIds.add(socket.id)
          this.queryIdInfoMap.set(queryId, keyInfo)
          // 不需要重新订阅，但是需要设置 socketId 和 queryId 的对应关系
          this.addSocketIdQueryId(socket.id, queryId)
          return
        }
        this.addSocketIdQueryId(socket.id, queryId)
        this.remoteSubscribe(queryId, query, socket)
      } else {
        this.logger.info(`[frontier] unsub ${socket.id} query: ${queryId}`)
        if (meta.op === SubOP.unsub) {
          socket.leave(queryId)
          this.remoteUnSubscribe(queryId, socket.id)
        }
      }
    })

    socket.on('disconnect', () => {
      this.logger.info(`[frontier] disconnect ${socket.id}`)
      const queryIds = this.socketIdQueryIdsMap.get(socket.id)
      if (!queryIds) {
        this.logger.info(`[frontier] no ${socket.id} after disconnect`)
        return
      }
      for (const queryId of queryIds) {
        this.remoteUnSubscribe(queryId, socket.id)
      }
    })
  }

  async requestData_LOG(
    query: SubQueryParams[SubscribeCommands.Log],
    ignoreFinished?: boolean,
  ): Promise<null | SubPayloadContents[SubscribeCommands.Log]> {
    // 已经 finished 的任务，不去获取更新
    const prevState = this.getLastState(query)

    let resultChain
    try {
      const params = {
        token: query.token,
        [query.queryType === 'chainId' ? 'chain_id' : 'nb_name']: query.key,
      }
      this.logger.info(`io-frontier logger requestData_LOG task params: ${JSON.stringify(params)}`)
      const userName = (
        await getUserInfo(query.token, {
          'x-custom-host': query.marsServerHost,
          'x-custom-mars-server': query.marsServerURL,
        })
      )?.user_name
      if (!userName) {
        throw new Error('userName not found')
      }
      resultChain = await RUserTaskRequester.rGetTask({
        params,
        marsServerConfig:
          query.marsServerHost && query.marsServerURL
            ? {
                marsServerURL: query.marsServerURL,
                marsServerHost: query.marsServerHost,
              }
            : undefined,
        userName,
      })
      if (!resultChain) throw new Error('no task')
    } catch (e) {
      this.logger.warn(`io-frontier logger requestData_LOG task error: ${e}`)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.fatalErrorHandler &&
        this.fatalErrorHandler(e as Error, {
          ioCommand: this.ioCommand,
          skipIoEmitFatal: true,
        })

      return {
        success: 0,
        msg: LogErrors.LookUpChainFailed,
      }
    }

    if (
      query.queryType === 'chainId' &&
      prevState?.chain?.queue_status === 'finished' &&
      resultChain?.queue_status === 'finished' &&
      !ignoreFinished
    ) {
      return null
    }

    if (query.rank >= Number(resultChain.nodes)) {
      return {
        chain: resultChain,
        success: 0,
        msg: LogErrors.RankOutOfRange,
      }
    }

    // hint: 这里的改动是为了兼容旧版本的 log
    // @ts-expect-error 旧版兼容
    resultChain.pods = resultChain._pods_
    // @ts-expect-error 旧版兼容
    resultChain.chainStatus = computeChainStatus(resultChain)
    // @ts-expect-error 旧版兼容
    resultChain.chain_status = computeChainStatus(resultChain)
    const { chain_id } = resultChain

    // Log 部分
    const params = {
      token: query.token,
      chain_id,
      rank: query.rank,
      service: query.service,
    }
    let lastSeen = prevState?.lastSeen ?? null
    // 如果是 nbName 查找，chain 变动时作废掉 lastSeen
    if (prevState?.chain?.chain_id !== chain_id) {
      lastSeen = null
    }
    if (lastSeen) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error 不严格校验
      params.last_seen = JSON.stringify(lastSeen)
    }
    this.logger.info(`socket get log, params: ${JSON.stringify(params)}`)
    let logResult: GetTaskLogResult

    try {
      logResult = await GlobalApiServerClient.request(ApiServerApiName.GET_TASK_LOG, params, {
        baseURL: query.marsServerURL,
        headers: query.marsServerHost
          ? {
              Host: query.marsServerHost,
            }
          : {},
      })
      if (logResult.data === '还没产生日志') {
        logResult.data = ''
      }
    } catch (e) {
      this.fatalErrorHandler &&
        this.fatalErrorHandler(e as Error, {
          ioCommand: this.ioCommand,
          skipIoEmitFatal: true,
        })
      return {
        success: 0,
        msg: LogErrors.GetLogFailed,
      }
    }

    return {
      success: 1,
      msg: 'success',
      chain: resultChain,
      data: lastSeen ? logResult.data : undefined,
      stop_code: logResult.stop_code,
      fullLog: lastSeen ? undefined : logResult.data,
      restart_log: logResult.restart_log,
      error_msg: logResult.error_msg ?? '',
      last_seen: logResult.last_seen ?? lastSeen,
    }
  }
}

export const GetLogSubscribeHandlerInstance = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new LogServer({
    ...getConfigMixin(io, SubscribeCommands.Log),
    interval: 8000,
    ioCommand: SubscribeCommands.Log,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.Log],
    // 这里使用 this 不是很方便，不使用传参的方法了。
    async requestData() {
      await Promise.resolve(null)
    },
  })
}
