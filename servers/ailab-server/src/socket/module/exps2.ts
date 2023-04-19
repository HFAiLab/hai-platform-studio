import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { GetUserTasksResult } from '@hai-platform/client-api-server'
import {
  IOFrontierServer,
  ServerSchemaGenerator,
  compareContentChangeDefaultImpl,
} from '@hai-platform/io-frontier/lib/cjs/server/index'
import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import stringifyInOrder from 'fst-stable-stringify'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { logger } from '../../base/logger'
import { BFF_REDIS_KEYS } from '../../config'
import { GlobalApiServerClient } from '../../req/apiServer'
import { SubChangeKeysConfig, SubscribeCommands } from '../../schema/index'
import type { SubQueryParams } from '../../schema/index'
import { hrtime2ms } from '../../utils'
import { ioHistogram } from '../metrics'
import { getConfigMixin } from '../mixin'
import { GlobalUserLastActivity } from '../service/userLastActivity'

// UPDATE: 目前 QueryServer 存在主从延迟，我们这里取 6 秒以前的信息 --> 目前主从延迟没那么高了，适当降低
const DelayCompensationTime = 5 * 1000

class ExpsServerSchemaGenerator extends ServerSchemaGenerator {
  public override genQueryId(
    command: string,
    query: SubQueryParams[SubscribeCommands.Experiments2],
  ) {
    const ns = this.getNS()
    // hint: 不转 base64 的话由于 : 的存在层级太多了，会导致不太可能观测
    return `${ns}:${command}:${query.userName}:${Buffer.from(stringifyInOrder(query)).toString(
      'base64',
    )}`
  }

  public getRedisDataPrefix(command: string, userName: string) {
    const ns = this.getNS()
    return `${ns}:ws:data:${ns}:${command}:${userName}`
  }
}

class ExpsIOFrontierServer extends IOFrontierServer<
  SubQueryParams[SubscribeCommands.Experiments2]
> {
  localReqChangeTime: number | null = null

  protected async requestChangedUser(lastUpdateMS: number) {
    const begin = Date.now()
    const lastUpdateNS = Math.ceil(lastUpdateMS * 1e6) // 单位：纳秒
    const recentUsers = await GlobalUserLastActivity.getRecentUsers()
    const changedUserNames: string[] = []

    while (recentUsers.length) {
      const user = recentUsers.shift()!
      if (user.ts < lastUpdateNS) {
        break
      }
      changedUserNames.push(user.user_name)
    }
    if (Date.now() - begin > 100) {
      logger.warn(`requestChangedUser cost more than 100: ${Date.now() - begin}`)
    }
    if (changedUserNames.length)
      logger.info(
        `changedUserNames, length: ${changedUserNames.length}, detail:`,
        changedUserNames.join(','),
      )
    return changedUserNames
    /**
     * update: 之前我们这里是通过 http 请求来获取 recent_user，现在采用读 redis 的方式
     * hint:
     * 我们这里之前是对用户进行过滤的，选出当时有 socket 链接的用户，不过这样的问题是：
     * 我们很难管理一个用户的多个设备，特别是多个设备被路由到不同的 node 服务上面的时候，由于设备和用户 ID 并没有太强的关系，这个时候很难维护
     * 所以我们这里就不过滤了，我们一次能获取到的变化的用户应该也是有限的
     */
  }

  // eslint-disable-next-line class-methods-use-this
  getNameRedisChangeKeyTag(name: string) {
    return `exps_changes_v2:${name}`
  }

  public async deleteQueryKey(query: SubQueryParams[SubscribeCommands.Experiments2]) {
    const redis = await this.redisConn.getClient()
    redis.del(this.getNameRedisChangeKeyTag(query.userName))
  }

  protected override async getNextData(
    queryId: string,
    query: SubQueryParams[SubscribeCommands.Experiments2],
  ): Promise<any | null> {
    const redis = await this.redisConn.getClient()
    const redisDataId = this.schemaGenerator.genRedisDataId(queryId)
    const data = await redis.get(redisDataId)
    // this.logger.info('[frontier] ExpsIOFrontierServer getNextData, len', data?.length);
    if (!data) {
      const lockSuccess = await this.redisConn.lock(
        this.schemaGenerator.genRedisLockDataId(queryId),
        this.SUB_INTERVAL / 1000,
      )
      this.logger.info('exps2 lockSuccess:', lockSuccess)
      if (!lockSuccess) {
        this.logger.warn('getNextData hit lock unsuccess exps2')
        return null
      }
      const nextData = await this.requestData(query, this)
      redis.set(redisDataId, JSON.stringify(nextData), {
        // 过期时间设置为 1h，防止泄漏
        EX: 60 * 60,
      })
      return nextData
    }

    /**
     * Update 因为这个和 queryID 无关，这里异步会造成额外请求
     * 我们这里的目的是减少 get recent user 的调用
     * 所以这里多一层判断：
     *
     *  1.第一层判断是因为 Redis 访问是异步的，为了避免本机过多请求，所以先对本机的请求做限流
     *      也就是说，在一个时间段内，单节点只有一个去请求 redis
     *  2.然后在看 Redis 这一层的竞争，多个节点在同一个时间段内，只有一个满足条件
     * */
    const currentTimeStamp = getUTC8TimeStamp()
    if (
      !this.localReqChangeTime ||
      currentTimeStamp - Number(this.localReqChangeTime) > this.SUB_INTERVAL
    ) {
      this.localReqChangeTime = currentTimeStamp
      const lastReqChangesTime = await redis.get(BFF_REDIS_KEYS.exp_changes_last_change_time)
      // this.logger.info(`exps UTC8 currentTimeStamp: ${currentTimeStamp}, lastReqChangesTime:${lastReqChangesTime}`)
      if (
        !lastReqChangesTime ||
        currentTimeStamp - Number(lastReqChangesTime) > this.SUB_INTERVAL
      ) {
        const changeUsers = await this.requestChangedUser(
          Number(lastReqChangesTime) - DelayCompensationTime,
        )
        const changeInfo = changeUsers.map((userName) => {
          return [this.getNameRedisChangeKeyTag(userName), '1'] as [string, string]
        })
        changeInfo.push([BFF_REDIS_KEYS.exp_changes_last_change_time, `${currentTimeStamp}`])
        const res = await redis.mSet(changeInfo)
        if (res.toString() !== 'OK') this.logger.error(`getNextData redis error: ${res}`)
      }
    }

    const changedUnused = await redis.get(this.getNameRedisChangeKeyTag(query.userName))
    if (changedUnused) {
      // hint:
      // 我们这里直接根据前缀，把用户所有可能过期的 exps payload 都删除了，以解决一个人多个订阅可能造成的问题
      const prefix = (this.schemaGenerator as ExpsServerSchemaGenerator).getRedisDataPrefix(
        this.ioCommand,
        query.userName,
      )
      const redisExpKeysForUserName = await redis.keys(`${prefix}:*`)
      this.logger.info(
        `redis del v2 exps for current user: ${query.userName}, keys: ${redisExpKeysForUserName.length}`,
      )
      if (redisExpKeysForUserName.length) await redis.del(redisExpKeysForUserName)
      const nextData = await this.requestData(query, this)
      const nextDataStr = JSON.stringify(nextData)
      // this.logger.info('consume changedUnused and set nextData:', nextDataStr.length)
      redis.set(redisDataId, nextDataStr, {
        // 过期时间设置为 1h，防止泄漏
        EX: 60 * 60,
      })
      return nextData
    }
    try {
      return JSON.parse(data)
    } catch (e) {
      console.info(data)
      return null
    }
  }
}
export const GetExpsSubscribeHandlerInstance2 = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  return new ExpsIOFrontierServer({
    ...getConfigMixin(io, SubscribeCommands.Experiments2),
    interval: 3010,
    ioCommand: SubscribeCommands.Experiments2,
    subChangedKeys: SubChangeKeysConfig[SubscribeCommands.Experiments2],
    schemaGenerator: new ExpsServerSchemaGenerator(),
    async requestData(
      query: SubQueryParams[SubscribeCommands.Experiments2],
      instance: IOFrontierServer<SubQueryParams[SubscribeCommands.Experiments2]>,
    ) {
      const startTime = process.hrtime() // 开始时间
      ;(instance as ExpsIOFrontierServer).deleteQueryKey(query)
      logger.info(query.userName, ' GET_USER_TASKS: ', JSON.stringify(query))
      const result = await GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASKS, query, {
        baseURL: query.marsServerURL,
        headers: query.marsServerHost
          ? {
              Host: query.marsServerHost,
            }
          : {},
      })
      const dur = hrtime2ms(process.hrtime(startTime)) // 计算请求处理时间
      ioHistogram.observe({ path: '/query/tasks' }, dur)
      logger.info(`[exps] request data cost ${dur}`)
      return result
    },
    compareContentChange(
      originContents: GetUserTasksResult,
      contents: GetUserTasksResult,
      keys: string[] | string,
    ): string[] {
      const changeKeys = []
      if (!contents) {
        this.logger?.info('exps contents are null')
        return []
      }
      if (!originContents) {
        this.logger?.info(`tasks originContents is null and return ${keys}`)
        return typeof keys === 'string' ? [keys] : keys
      }
      if (originContents.total !== contents.total) {
        changeKeys.push('total')
      }
      const res = [
        ...changeKeys,
        ...compareContentChangeDefaultImpl(originContents.tasks, contents.tasks, keys),
      ]
      if (res && res.length) logger.info('exps change keys:', res)
      return res
    },
  })
}
