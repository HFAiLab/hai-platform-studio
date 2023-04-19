import fs from 'fs/promises'
import path from 'path'
import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import dayjs from 'dayjs'
import fsExtra from 'fs-extra'
import { getLogDir, logger } from '../../base/logger'
import { BFF_REDIS_KEYS, isOnline, isPrePub, isProd } from '../../config'
import { bffRedisConn } from '../../redis'
import { sleep } from '../../utils/promise'
import type { FetionAlertParams } from './fetion'
import { getFetionClient } from './fetion'
import type { AggFetionRequest } from './schema'
import { AggFetionSource, AggStrategyName } from './schema'
import { GlobalAggFetionQueue } from './store/queue'
import type { FetionStrategy } from './strategies/strategy'
import {
  BFFGetTaskLogStrategy,
  BFFOneAndOneStrategy,
  BatchReportStrategy,
  OneAndBatchReportStrategy,
} from './strategies/strategy'

interface PersistentObjectInfo {
  dateKey: string
  obj: any[]
}

export class AggFetion {
  // 可以直接拿来用的 fetion 日志目录
  private fetionLogDir: string

  // 临时存储当天数据
  private currentPersistentObject: PersistentObjectInfo | null = null

  // 策略 handler 存储
  private strategiesMap: Map<AggStrategyName, FetionStrategy>

  // 标志着开启了上报检测循环的一个时间戳
  private loopStartTime: number | null = null

  // 上次同步时间
  private lastSyncTime: number | null = null

  // 去重超时时间：暂定 2 min
  private filterDuplicateTimeout = 2 * ONEMINUTE

  // 单次批处理时间：
  private filterTickTimeout = 5 * 1000

  combineStrategies = () => {
    const options = {
      report: this.report,
    }

    this.strategiesMap = new Map([
      [AggStrategyName.one_and_one, new BFFOneAndOneStrategy(options)],
      [AggStrategyName.bff_get_task_log, new BFFGetTaskLogStrategy(options)],
      [AggStrategyName.one_and_batch, new OneAndBatchReportStrategy(options)],
      [AggStrategyName.batch, new BatchReportStrategy(options)],
    ])
  }

  constructor() {
    logger.info('[agg-fetion] call constructor')
    this.fetionLogDir = path.join(
      getLogDir(),
      'agg_fetion',
      // eslint-disable-next-line no-nested-ternary
      isOnline() ? 'online' : isPrePub() ? 'prepub' : 'local',
    )
    fsExtra.ensureDirSync(this.fetionLogDir)
    this.combineStrategies()
  }

  private report = (params: FetionAlertParams) => {
    logger.info(`[Fetion] ${params.groupName} ${params.namespace} ${params.msg}`)

    if (!isProd()) {
      return
    }

    const fetionClient = getFetionClient()
    logger.info(`[Fetion] call fetion alert`)
    // eslint-disable-next-line consistent-return
    return fetionClient.alert(params).catch((e) => {
      logger.error('fetion report error:', e)
    })
  }

  private getFetionLogDir = () => {
    return path.join(
      this.fetionLogDir,
      // eslint-disable-next-line no-nested-ternary
      isOnline() ? 'online' : isPrePub() ? 'prepub' : 'local',
    )
  }

  public handleFetionRequest = async (fetionRequest: AggFetionRequest) => {
    logger.info('handleFetionRequest:', fetionRequest)

    const currentPersistentObject = await this.getPersistentObject()
    currentPersistentObject.obj.push(
      JSON.stringify({
        fetionRequest,
        timestamp: getUTC8TimeStamp(),
      }),
    )
    this.trySyncPersistentObject() // 不 await 了，加快可能的返回速度

    /**
     * 目前经过调整，大多数都是只有一个策略
     * 最终的做法大概是：找到对应的策略，挨个执行，如果前一个返回 end，不执行下一个
     */
    const strategies =
      fetionRequest.strategyGroup.name instanceof Array
        ? fetionRequest.strategyGroup.name
        : [fetionRequest.strategyGroup.name]

    if (!strategies.length) {
      logger.error('handle fetion request error, strategy is not found')
      return
    }

    for (const strategyName of strategies) {
      const strategyInstance = this.strategiesMap.get(strategyName as AggStrategyName)
      if (!strategyInstance) {
        logger.warn(`[agg-fetion] ${strategyName} not found matched strategy instance`)
        continue
      }

      logger.info(`begin ${strategyName} strategyInstance.handle`)
      const handleResult = await strategyInstance.handle(fetionRequest)
      if (handleResult.end) break
    }
  }

  public startHandler = async () => {
    logger.info(`[agg-fetion] start handler`)

    const currentTimeStamp = getUTC8TimeStamp()

    this.loopStartTime = currentTimeStamp

    while (this.loopStartTime === currentTimeStamp) {
      while (GlobalAggFetionQueue.handlerQueue.length) {
        const fetionRequest = GlobalAggFetionQueue.handlerQueue.shift()!
        await this.handleFetionRequest(fetionRequest)
      }
      await sleep(1000)
    }
  }

  public stopHandler = () => {
    this.loopStartTime = null
  }

  public startFilter = () => {
    logger.info(`[agg-fetion] start filter`)
    this.filterLoop()
  }

  /**
   *
   * 文件同步相关的内容
   *
   */
  private async tryGetFileContent(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as any[]
    } catch (e) {
      return null
    }
  }

  private async syncPersistentObject() {
    if (!this.currentPersistentObject) return
    fsExtra.ensureDirSync(this.getFetionLogDir())
    const logDir = path.join(this.getFetionLogDir(), `${this.currentPersistentObject.dateKey}.log`)
    await fs.writeFile(logDir, JSON.stringify(this.currentPersistentObject.obj, null, 2))
  }

  private async trySyncPersistentObject() {
    if (this.lastSyncTime && getUTC8TimeStamp() - this.lastSyncTime < ONEMINUTE) {
      return
    }
    await this.syncPersistentObject()
  }

  private async getPersistentObject() {
    // 根据当前日期获取应该持久化存储的地方
    const dateKey = dayjs(new Date()).format('YYYY_MM_DD')

    if (!this.currentPersistentObject || this.currentPersistentObject.dateKey !== dateKey) {
      const nextLogDir = path.join(this.getFetionLogDir(), `${dateKey}.log`)
      const obj = (await this.tryGetFileContent(nextLogDir)) || []

      await this.syncPersistentObject()
      this.currentPersistentObject = {
        dateKey,
        obj,
      }
    }

    return this.currentPersistentObject
  }

  /**
   * 过滤一定时间内，对立来源的相同的报错
   */
  filterLoop = async () => {
    const redis = await bffRedisConn.getClient()

    // 一个一个取，串行执行
    while (GlobalAggFetionQueue.parsedQueue.length) {
      const parsedInfo = GlobalAggFetionQueue.parsedQueue.shift()!
      logger.info('filterLoop parsedInfo:', parsedInfo)

      if (![AggFetionSource.cluster, AggFetionSource.axios].includes(parsedInfo.source)) {
        // 如果不是这两种，不需要去重，目前基本都是 bff 自己报的，直接放入解析队列即可
        GlobalAggFetionQueue.handlerQueue.push(parsedInfo.request)
        continue
      }

      // step1：去重
      const oppositeSource =
        parsedInfo.source === AggFetionSource.axios
          ? AggFetionSource.cluster
          : AggFetionSource.axios
      const oppositeRedisKey = `${BFF_REDIS_KEYS.bff_agg_fetion_http_ref_count}:${oppositeSource}_${parsedInfo.key}`
      let oppositeRedisKeyCount = (await redis.get(oppositeRedisKey)) as number | null
      if (oppositeRedisKeyCount) oppositeRedisKeyCount = Number(oppositeRedisKeyCount)
      logger.info(
        `[d20] oppositeRedisKey: ${oppositeRedisKey} oppositeRedisKeyCount: ${oppositeRedisKeyCount}`,
      )
      if (oppositeRedisKeyCount && oppositeRedisKeyCount >= 1) {
        // 如果 DuplicateTimeout 毫秒内有一个对立来源的到来了，就认为这个是重复的
        const nextOppositeRedisKeyCount = oppositeRedisKeyCount - 1
        if (nextOppositeRedisKeyCount < 1) {
          await redis.del(oppositeRedisKey)
        } else {
          await redis.set(oppositeRedisKey, nextOppositeRedisKeyCount, {
            PX: this.filterDuplicateTimeout,
          })
        }
        continue
      }

      // step2: 标志当前数量
      const currentRedisKey = `${BFF_REDIS_KEYS.bff_agg_fetion_http_ref_count}:${parsedInfo.source}_${parsedInfo.key}`
      const currentRedisKeyCount = (await redis.get(currentRedisKey)) as number | null
      const nextCurrentCount = currentRedisKeyCount ? Number(currentRedisKeyCount) + 1 : 1
      logger.info(
        `[d20] currentRedisKey: ${currentRedisKey} currentRedisKeyCount: ${nextCurrentCount}, nextCurrentCount: ${nextCurrentCount}`,
      )
      await redis.set(currentRedisKey, nextCurrentCount, {
        PX: this.filterDuplicateTimeout,
      })
      GlobalAggFetionQueue.handlerQueue.push(parsedInfo.request)
    }

    // hint: 延迟一点点时间再检查，永无穷尽，优化一点的话可以改成惰性的
    setTimeout(this.filterLoop, this.filterTickTimeout)
  }
}
