/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import { logger } from '../../../base/logger'
import { BFF_REDIS_KEYS } from '../../../config'
import { bffRedisConn } from '../../../redis'
import { Base64 } from '../../../utils/base64'
import type { FetionAlertParams } from '../fetion'
import { AlertType } from '../fetion'
import type { AggFetionRequest, StrategyHandlerResult } from '../schema'

interface FetionRuleOptions {
  report: (params: FetionAlertParams) => Promise<void> | undefined
}

export abstract class FetionStrategy {
  static strategyName: string

  protected report: (params: FetionAlertParams) => Promise<void> | undefined

  constructor(options: FetionRuleOptions) {
    this.report = options.report
  }

  abstract handle(fetionRequest: AggFetionRequest): Promise<StrategyHandlerResult>

  /**
   * 整合多条信息为一条可以发送的信息
   * @param requests
   * @returns
   */
  statRequestsByUniqueMessage = (requests: AggFetionRequest[]) => {
    const stat = [
      ...Object.entries(
        requests
          .map((request) => {
            const uniqueMessage = (request.payload.message || request.payload.agg_keyword)!
            return uniqueMessage.replace(/ACCESS-(.{3}).*?(\/|$)/, 'ACCESS-$1***') // 去除 access token
          })
          .reduce((p: Record<string, number>, currentStr: string) => {
            p[currentStr] = p[currentStr] ? p[currentStr]! + 1 : 1
            return p
          }, {} as Record<string, number>),
      ),
    ]
      .map(([key, v]) => `${key} (${v}次)`)
      .join(', ')

    return stat
  }
}

export class BFFOneAndOneStrategy extends FetionStrategy {
  // eslint-disable-next-line require-await
  handle = async (fetionRequest: AggFetionRequest) => {
    this.report({
      type: AlertType.confirm,
      namespace: fetionRequest.meta.source,
      msg: `${fetionRequest.payload.message}`,
      groupName: fetionRequest.target.groupName,
      assign: fetionRequest.target.assign,
    })

    return {
      end: true,
    }
  }
}

interface AggBatchInfo {
  requests: {
    timestamp: number
    request: AggFetionRequest
  }[]
  lastReportTime: number | null
}

export class BatchReportStrategy extends FetionStrategy {
  defaultInterval = 3 * ONEMINUTE

  defaultBatchSize = 10

  batchMap = new Map<string, AggFetionRequest[]>()

  aggBatchMap = new Map<string, AggBatchInfo>()

  aggBatchTimeoutMap = new Map<string, NodeJS.Timeout>()

  // eslint-disable-next-line require-await
  handle = async (fetionRequest: AggFetionRequest) => {
    const aggKeyWord = fetionRequest.payload.agg_keyword || fetionRequest.payload.message
    const currentTimeStamp = getUTC8TimeStamp()

    if (this.aggBatchMap.has(aggKeyWord)) {
      const aggBatchInfo = this.aggBatchMap.get(aggKeyWord)!

      // 先加进去这一条：
      aggBatchInfo.requests.push({
        request: fetionRequest,
        timestamp: currentTimeStamp,
      })

      // 删除无用的：
      while (
        aggBatchInfo.requests.length &&
        aggBatchInfo.requests[0]!.timestamp < currentTimeStamp - this.defaultInterval
      ) {
        aggBatchInfo.requests.shift()
      }

      // 最近三分钟，超了:
      if (aggBatchInfo.requests.length >= this.defaultBatchSize) {
        // 有定时任务在处理，第一次或者间隔久了肯定没有：
        if (this.aggBatchTimeoutMap.has(aggKeyWord)) return { end: true }

        if (
          !aggBatchInfo.lastReportTime ||
          aggBatchInfo.lastReportTime < currentTimeStamp - this.defaultInterval
        ) {
          // 最近 3min 已经没有报过，报一下
          this.checkAndReport(
            aggKeyWord,
            aggBatchInfo.requests.map((item) => item.request),
          )
          aggBatchInfo.lastReportTime = currentTimeStamp
          aggBatchInfo.requests = []
        } else {
          // 最近 3 min 已经报过一次了，休息一会再查一次
          const timerId = setTimeout(() => {
            this.aggBatchTimeoutMap.delete(aggKeyWord)
            const currentBatchInfo = this.aggBatchMap.get(aggKeyWord)!
            // 这里可能有一个问题，如果这个时候又来一条，触发过期的删除，可能是会少报一次的
            if (currentBatchInfo.requests.length >= this.defaultBatchSize) {
              this.checkAndReport(
                aggKeyWord,
                currentBatchInfo.requests.map((item) => item.request),
              )
              aggBatchInfo.lastReportTime = getUTC8TimeStamp()
            }

            currentBatchInfo.requests = []
          }, this.defaultInterval - (currentTimeStamp - aggBatchInfo.lastReportTime))
          this.aggBatchTimeoutMap.set(aggKeyWord, timerId)
        }
      }
    } else {
      // 第一次的话，肯定啥也不干是没问题的
      this.aggBatchMap.set(aggKeyWord, {
        lastReportTime: null,
        requests: [
          {
            request: fetionRequest,
            timestamp: currentTimeStamp,
          },
        ],
      })
    }

    return {
      end: true,
    }
  }

  checkAndReport = (aggKeyWord: string, requests: AggFetionRequest[]) => {
    logger.info(`[batch] checkAndReport:`, aggKeyWord)

    if (!requests || !requests.length) {
      return
    }

    const firstRequest = requests[0]!
    const stat = this.statRequestsByUniqueMessage(requests)

    const combinedMessage = `${stat}`

    this.report({
      type: AlertType.error,
      namespace: requests.length === 1 ? firstRequest.meta.source : '[聚合]',
      msg: combinedMessage,
      groupName: firstRequest.target.groupName,
      assign: firstRequest.target.assign,
    })
  }

  /**
   * 大概思路：
   每次放入：

   删除 3min 以前的内容
   达到数量并且 3min 没报过，上报清空
   达到数量并且 3min 报过，比如 1.5min，
      之后来的新的，如果有正在等的定时器，就只处理队列，如果没有正在处理的定时器，回到上一次判断

   这样能保证：第一次是准的，后面是有的
   */
}

export class OneAndBatchReportStrategy extends BatchReportStrategy {
  override defaultInterval = ONEMINUTE

  // 第一条立刻上报，出现更多则每 n 分钟聚合上报一次该报错的数量和摘要信息
  // eslint-disable-next-line require-await
  override handle = async (fetionRequest: AggFetionRequest) => {
    const aggKeyWord = fetionRequest.payload.agg_keyword || fetionRequest.payload.message

    if (this.batchMap.has(aggKeyWord)) {
      const requests = this.batchMap.get(aggKeyWord)!
      requests.push(fetionRequest)
    } else {
      this.batchMap.set(aggKeyWord, [])
      this.report({
        type: AlertType.error,
        namespace: fetionRequest.meta.source,
        msg: `${fetionRequest.payload.message}`,
        groupName: fetionRequest.target.groupName,
        assign: fetionRequest.target.assign,
      })

      setTimeout(() => {
        this.checkAndReport(aggKeyWord)
      }, this.defaultInterval)
    }

    return {
      end: true,
    }
  }

  override checkAndReport = (aggKeyWord: string) => {
    logger.info(`[one_and_batch] checkAndReport:`, aggKeyWord)
    const requests = this.batchMap.get(aggKeyWord)

    if (!requests || !requests.length) {
      this.batchMap.delete(aggKeyWord)
      return
    }

    const firstRequest = requests[0]!
    const stat = this.statRequestsByUniqueMessage(requests)

    const combinedMessage = `${stat}`

    this.report({
      type: AlertType.error,
      namespace: requests.length === 1 ? firstRequest.meta.source : '[聚合]',
      msg: combinedMessage,
      groupName: firstRequest.target.groupName,
      assign: firstRequest.target.assign,
    })

    this.batchMap.set(aggKeyWord, [])

    setTimeout(() => {
      this.checkAndReport(aggKeyWord)
    }, this.defaultInterval)
  }
}

export class BFFGetTaskLogStrategy extends FetionStrategy {
  // 如果这里不用 redis await 才可以是同步
  handle = async (fetionRequest: AggFetionRequest) => {
    const aggKeyWord = (fetionRequest.payload.agg_keyword || fetionRequest.payload.message)!
    const base64AggKeyWord = Base64.encode(aggKeyWord)

    const redis = await bffRedisConn.getClient()
    const redisKey = `${BFF_REDIS_KEYS.bff_agg_fetion_get_task_log}_${base64AggKeyWord}`
    const redisHit = await redis.get(redisKey)

    if (redisHit) {
      return {
        end: true,
      }
    }

    await redis.set(redisKey, 1)
    const { source } = fetionRequest.meta

    this.report({
      type: AlertType.error,
      namespace: source,
      msg: `${fetionRequest.payload.message}`,
      groupName: fetionRequest.target.groupName,
      assign: fetionRequest.target.assign,
    })

    return { end: true }
  }
}
