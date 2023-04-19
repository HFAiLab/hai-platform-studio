import type { GetUserTaskParams, ServiceTaskTasksApiParams } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import type { ExtendedTask } from '@hai-platform/shared'
import { HFNoCacheHeader } from '@hai-platform/shared'
import type { ServiceTasksIOResult } from '@hai-platform/studio-schemas'
import { ONEHOUR } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import stringifyInOrder from 'fst-stable-stringify'
import { logger } from '../../base/logger'
import { BFF_REDIS_KEYS, GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES } from '../../config'
import { bffRedisConn } from '../../redis'
import { GlobalApiServerClient } from '../../req/apiServer'
import { Base64 } from '../../utils/base64'
import { GlobalPromiseSingletonExecuter } from '../../utils/promise'
import { GlobalUserLastActivity } from './userLastActivity'

interface UserTaskRedisCache {
  task: ExtendedTask
  ts: number
}

interface MarsServerConfig {
  marsServerURL: string
  marsServerHost: string
}

interface RGetTaskOptions {
  params: GetUserTaskParams
  userName: string
  marsServerConfig?: MarsServerConfig
}

interface RGetServiceTasksOptions {
  params: ServiceTaskTasksApiParams
  userName: string
  marsServerConfig?: MarsServerConfig
}

interface ServiceTasksRedisCache {
  cacheResult: ServiceTasksIOResult
  ts: number
}

export class RUserTaskRequester {
  static rGetTask = async (options: RGetTaskOptions): Promise<ExtendedTask | null> => {
    if (options.marsServerConfig) {
      return (
        await GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASK, options.params, {
          baseURL: options.marsServerConfig.marsServerURL,
          headers: options.marsServerConfig.marsServerHost
            ? {
                ...HFNoCacheHeader,
                Host: options.marsServerConfig.marsServerHost,
              }
            : { ...HFNoCacheHeader },
        })
      ).task
    }

    const paramsKey = Base64.encode(stringifyInOrder(options.params))
    const taskRedisKey = `${BFF_REDIS_KEYS.socket_user_task_cache}:${options.userName}:${paramsKey}`
    const promiseKey = `${GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.socket_get_user_task}:${options.userName}:${paramsKey}`

    const redis = await bffRedisConn.getClient()

    const requestAndUpdateCache = async (ts: number) => {
      try {
        const { task } = await GlobalPromiseSingletonExecuter.execute(
          () =>
            GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASK, options.params, {
              headers: {
                ...HFNoCacheHeader,
              },
            }),
          [],
          promiseKey,
        )
        logger.info(
          `requestAndUpdateCache ${task.chain_id}, queue_status: ${task.queue_status}, worker_status:  ${task.worker_status}`,
        )
        await redis.set(
          taskRedisKey,
          JSON.stringify({
            ts,
            task,
          }),
          {
            PX: ONEHOUR / 2, // 以毫秒为单位设置过期时间，默认一小时 / 2
          },
        )
        return task
      } catch (e) {
        if (`${e}`.includes('没有符合条件的任务')) {
          // 这个全局会抛一个没有符合条件的任务，这个其实是正常的
          logger.warn('[rGetTask] 没有符合条件的任务', options.params)
          await redis.set(
            taskRedisKey,
            JSON.stringify({
              ts,
              task: null,
            }),
            {
              PX: ONEHOUR, // 以毫秒为单位设置过期时间，默认一小时
            },
          )
          return null
        }

        throw e
      }
    }

    const cacheTaskStr = await redis.get(taskRedisKey)
    const recentUsers = await GlobalUserLastActivity.getRecentUsers()
    const user = recentUsers.find((userInfo) => userInfo.user_name === options.userName)
    if (!user) {
      logger.warn(
        `rGetTask error, user last activity not found from redis, userName: ${options.userName}`,
      )
      // 没有找到用户属于意外情况，请求一下返回即可
      return (await GlobalApiServerClient.request(ApiServerApiName.GET_USER_TASK, options.params))
        .task
    }

    if (!cacheTaskStr) {
      // logger.info('[rGetTask] requestAndUpdateCache because cache empty', options.userName)
      const res = await requestAndUpdateCache(user.ts)
      return res
    }

    const cacheTaskInfo = JSON.parse(cacheTaskStr) as UserTaskRedisCache

    if (cacheTaskInfo.ts < user.ts) {
      logger.info(
        `[rGetTask] requestAndUpdateCache ${options.userName}, cacheTaskInfo.ts: ${cacheTaskInfo.ts}, user.ts: ${user.ts}`,
      )

      const res = await requestAndUpdateCache(user.ts)
      return res
    }

    return cacheTaskInfo.task
  }

  // 获取用户的 service tasks
  static rGetServiceTasks = async (options: RGetServiceTasksOptions) => {
    if (options.marsServerConfig) {
      logger.info('rGetServiceTasks new request')
      const res = await GlobalApiServerClient.request(
        ApiServerApiName.SERVICE_TASK_TASKS,
        options.params,
        {
          baseURL: options.marsServerConfig.marsServerURL,
          headers: options.marsServerConfig.marsServerHost
            ? {
                Host: options.marsServerConfig.marsServerHost,
              }
            : {},
        },
      )
      return {
        tasks: res.tasks,
      }
    }

    // 其实只有 token
    const paramsKey = Base64.encode(stringifyInOrder(options.params))
    const redisKey = `${BFF_REDIS_KEYS.socket_user_service_task_cache}:${options.userName}:${paramsKey}`
    const promiseKey = `${GLOBAL_PROMISE_SINGLETON_EXECUTER_NAMES.socket_get_user_service_tasks}:${options.userName}:${paramsKey}`

    const redis = await bffRedisConn.getClient()

    const requestAndUpdateCache = async (ts: number) => {
      const res = await GlobalPromiseSingletonExecuter.execute(
        () => GlobalApiServerClient.request(ApiServerApiName.SERVICE_TASK_TASKS, options.params),
        [],
        promiseKey,
      )
      const cacheResult = {
        tasks: res.tasks,
      }
      await redis.set(
        redisKey,
        JSON.stringify({
          ts,
          cacheResult,
        }),
        {
          PX: ONEHOUR, // 以毫秒为单位设置过期时间，默认一小时
        },
      )
      return cacheResult
    }

    const cacheResultStr = await redis.get(redisKey)
    const recentUsers = await GlobalUserLastActivity.getRecentUsers()
    const user = recentUsers.find((userInfo) => userInfo.user_name === options.userName)
    if (!user) {
      logger.warn(
        `rGetServiceTasks error, user last activity not found from redis, userName: ${options.userName}`,
      )
      // 没有找到用户属于意外情况，请求一下返回即可
      const res = await GlobalApiServerClient.request(
        ApiServerApiName.SERVICE_TASK_TASKS,
        options.params,
      )
      return {
        tasks: res.tasks,
      }
    }

    if (!cacheResultStr) {
      return requestAndUpdateCache(user.ts)
    }
    const cacheTaskInfo = JSON.parse(cacheResultStr) as ServiceTasksRedisCache

    if (cacheTaskInfo.ts < user.ts) {
      logger.info(`rGetServiceTasks, cacheTaskInfo.ts: ${cacheTaskInfo.ts}, user.ts: ${user.ts}`)
      return requestAndUpdateCache(user.ts)
    }

    return cacheTaskInfo.cacheResult
  }
}
