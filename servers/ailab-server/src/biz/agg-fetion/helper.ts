import { logger } from '../../base/logger'
import { isOnline } from '../../config'
import { FETION_NOTICE_GROUPS } from './fetion'
import type {
  AggFetionRequest,
  FetionReport,
  FetionReportAxiosPayload,
  FetionReportClusterPayload,
} from './schema'
import { AggFetionSource, AggStrategyName } from './schema'
import { GlobalAggFetionQueue } from './store/queue'

// 针对不同 url，获取不同的超时报警时间
export const getReqLongTimeByURL = (url: string) => {
  if (url.includes('/delete_files')) {
    return 5 * 60 * 1000
  }
  if (url.includes('/list_cluster_files') || url.includes('operating/service_task/checkpoint')) {
    return 60 * 1000
  }
  // 日志大盘的接口建议 60 秒超时
  if (url.includes('/log_forest_delay_0') || url.includes('/log_forest_delay_15')) {
    return 60 * 1000
  }
  if (url.includes('ugc/sync_from_cluster/status') || url.includes('ugc/sync_to_cluster/status')) {
    return 30 * 1000
  }
  if (url.includes('ugc/sync_from_cluster') || url.includes('ugc/sync_to_cluster')) {
    return 60 * 1000
  }
  if (url.includes('ugc/get_sts_token')) {
    return 30 * 1000
  }
  return 10 * 1000 // 对于一般的请求，超过 10s，被认为是长时间的请求
}

export const judgeTimeoutError = (
  payload: FetionReportAxiosPayload | FetionReportClusterPayload,
) => {
  const reqLongTime = getReqLongTimeByURL(payload.url)

  // 优先判断 status_code
  if (payload.status_code && payload.status_code >= 500) {
    return {
      time: reqLongTime,
      ifTimeout: false,
    }
  }

  // response_time 大于 500
  if (!payload.response_time || payload.response_time < reqLongTime)
    return {
      time: reqLongTime,
      ifTimeout: false,
    }

  return {
    time: reqLongTime,
    ifTimeout: payload.response_time >= reqLongTime,
  }
}

/**
 * 解析 http 请求，变成通用的请求格式，并入队
 * 除了入队操作以外，几乎状态无关的纯函数，所以没有放入 instance
 */
export const parseAndEnqueue = (fetionReport: FetionReport) => {
  let parsedRequest: AggFetionRequest

  logger.info('parseAndEnqueue', fetionReport)

  if (fetionReport.source === AggFetionSource.cluster) {
    let message: string
    let strategy: string
    let agg_keyword = ''

    if (
      fetionReport.payload.url &&
      fetionReport.payload.url.includes('/monitor_v2/get_history_storage_stat')
    ) {
      return
    }

    const httpMethod = fetionReport.payload.method.toUpperCase()

    if (fetionReport.payload.status_code && fetionReport.payload.status_code >= 500) {
      message = `${httpMethod} ${fetionReport.payload.url} failed, status code: ${fetionReport.payload.status_code}`
      strategy = AggStrategyName.one_and_batch
    } else if (fetionReport.payload.response_time) {
      const judgeTimeoutRes = judgeTimeoutError(fetionReport.payload)
      if (!judgeTimeoutRes.ifTimeout) return
      if (fetionReport.payload.url.includes('get_task_log')) {
        // get_task_log 的超时直接忽略，只保留 bff 的，因为这里没有 params
        return
      }
      message = `${fetionReport.payload.url} ${Math.floor(judgeTimeoutRes.time / 1000)}秒超时`
      if (/((query|ugc|monitor_v2)\/)/.test(fetionReport.payload.url)) {
        agg_keyword = /((query|ugc|monitor_v2)\/)/.exec(fetionReport.payload.url)?.[0] || 'unknown'
        strategy = AggStrategyName.batch
      } else {
        strategy = AggStrategyName.one_and_batch
      }
    } else if (fetionReport.payload.error_message) {
      strategy = AggStrategyName.one_and_batch
      message = `${httpMethod} ${fetionReport.payload.url} failed, message: ${fetionReport.payload.error_message}`
    } else {
      logger.warn('unhandled error', fetionReport)
      return
    }

    if (!agg_keyword) agg_keyword = message

    parsedRequest = {
      meta: {
        source: fetionReport.source,
      },
      strategyGroup: {
        name: strategy,
      },
      target: {
        groupName: isOnline() ? FETION_NOTICE_GROUPS.ONLINE_DEV : FETION_NOTICE_GROUPS.PREPUB_DEV,
      },
      payload: {
        agg_keyword,
        message,
      },
    }

    GlobalAggFetionQueue.parsedQueue.push({
      source: AggFetionSource.cluster,
      key: message,
      request: parsedRequest,
    })
  } else if (fetionReport.source === AggFetionSource.axios) {
    let message: string
    let strategy: string
    let agg_keyword = ''

    const httpMethod = fetionReport.payload.method.toUpperCase()

    if (fetionReport.payload.status_code && fetionReport.payload.status_code >= 500) {
      message = `${httpMethod} ${fetionReport.payload.url} failed, status code: ${fetionReport.payload.status_code}`
      strategy = AggStrategyName.one_and_batch
    } else if (fetionReport.payload.response_time) {
      const judgeTimeoutRes = judgeTimeoutError(fetionReport.payload)
      if (!judgeTimeoutRes.ifTimeout) return

      if (fetionReport.payload.url.includes('query/task/log')) {
        message = `${httpMethod} ${fetionReport.payload.url} ${Math.floor(
          judgeTimeoutRes.time / 1000,
        )}秒超时，chain_id: ${fetionReport.payload.params?.chain_id || 'unknown_chain_id'}`
        strategy = AggStrategyName.bff_get_task_log
      } else {
        message = `${fetionReport.payload.url} ${Math.floor(judgeTimeoutRes.time / 1000)}秒超时`
        if (/(query|ugc|monitor_v2)\//.test(fetionReport.payload.url)) {
          agg_keyword =
            /((query|ugc|monitor_v2)\/)/.exec(fetionReport.payload.url)?.[0] || 'unknown'
          strategy = AggStrategyName.batch
        } else {
          strategy = AggStrategyName.one_and_batch
        }
      }
    } else if (fetionReport.payload.status_code === 404) {
      // 只有 bff(axios) 请求 404 才算
      strategy = AggStrategyName.one_and_batch
      message = `${httpMethod} ${fetionReport.payload.url} failed, status code: ${fetionReport.payload.status_code}`
    } else if (fetionReport.payload.error_message) {
      strategy = AggStrategyName.one_and_batch
      message = `${httpMethod} ${fetionReport.payload.url} failed, message: ${fetionReport.payload.error_message}`
    } else {
      logger.warn('unhandled error', fetionReport)
      return
    }

    if (!agg_keyword) agg_keyword = message

    parsedRequest = {
      meta: {
        source: fetionReport.source,
      },
      strategyGroup: {
        name: strategy,
      },
      target: {
        groupName: isOnline() ? FETION_NOTICE_GROUPS.ONLINE_DEV : FETION_NOTICE_GROUPS.PREPUB_DEV,
      },
      payload: {
        agg_keyword,
        message,
      },
    }
    GlobalAggFetionQueue.parsedQueue.push({
      source: AggFetionSource.axios,
      key: message,
      request: parsedRequest,
    })
  } else if (fetionReport.source === AggFetionSource.bff_notice) {
    const message = fetionReport.payload.content
    parsedRequest = {
      meta: {
        source: fetionReport.source,
      },
      strategyGroup: {
        name: AggStrategyName.one_and_one,
      },
      target: {
        groupName: isOnline()
          ? FETION_NOTICE_GROUPS.ONLINE_PUBLIC
          : FETION_NOTICE_GROUPS.PREPUB_DEV,
        assign: fetionReport.payload.assign,
      },
      payload: {
        message,
      },
    }
    GlobalAggFetionQueue.parsedQueue.push({
      source: fetionReport.source,
      key: message,
      request: parsedRequest,
    })
  } else if (fetionReport.source === 'bff_error') {
    const message = fetionReport.payload.content
    parsedRequest = {
      meta: {
        source: fetionReport.source,
      },
      strategyGroup: {
        name: AggStrategyName.one_and_batch,
      },
      target: {
        groupName: isOnline() ? FETION_NOTICE_GROUPS.ONLINE_DEV : FETION_NOTICE_GROUPS.PREPUB_DEV,
        assign: fetionReport.payload.assign,
      },
      payload: {
        agg_keyword: fetionReport.payload.keyword || message,
        message,
      },
    }
    GlobalAggFetionQueue.parsedQueue.push({
      source: fetionReport.source,
      key: message,
      request: parsedRequest,
    })
  } else {
    logger.warn('[agg-fetion] unFiltered fetion report', fetionReport)
  }
}
