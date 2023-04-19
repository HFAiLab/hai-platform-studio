import type {
  DataUsageSummaryResult,
  GetReportDataBody,
  GetReportDataListBody,
  UserNodeQuotaInfoParams,
} from '@hai-platform/client-ailab-server'
import type { OverViewType } from '@hai-platform/studio-schemas'
import {
  getLastDateStr,
  getLastNDateStrings,
} from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { getSingleUserQuota } from '../../base/quota'
import {
  CurrentScheduleTotalInfoConsumer,
  UserOutOfQuotaConsumer,
  getExternalTaskCount,
  getTaskTypedOverview,
} from '../../biz/cluster-consumer'
import { getExternalClusterOverview } from '../../biz/cluster-consumer/externalClusterOverview'
import { getCurrentTasksInfo } from '../../biz/cluster-consumer/funcs'
import {
  ExternalTotalGpuHourConsumer,
  GetReportConsumerInstance,
  ReportFileType,
  getUsageSeries,
} from '../../biz/custom-statistics'
import { getWorkerUserInfoLegacy } from '../../biz/quota'
import { getUserStorageUsage } from '../../biz/storage'

const externalTotalGpuHourConsumerInstance = new ExternalTotalGpuHourConsumer()

function register(router: Router) {
  router.post('/current_tasks_info', async (ctx, next) => {
    const force = !!ctx.query.force
    const user_name = (await getUserInfo(ctx.request.headers.token as string))?.user_name
    if (!user_name) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }

    logger.info('begin getCurrentTasksInfo')
    const currentTasksInfo = await getCurrentTasksInfo(user_name, force)
    logger.info('end getCurrentTasksInfo')
    fillResponse(ctx, true, currentTasksInfo)
    await next()
  })

  router.post('/current_total_count', async (ctx, next) => {
    const tasks = await CurrentScheduleTotalInfoConsumer.getInstance().getUserData()
    fillResponse(ctx, true, tasks || [])
    await next()
  })

  router.post('/get_tasks_typed_overview', async (ctx, next) => {
    // eslint-disable-next-line prefer-destructuring
    const taskType = ctx.request.query.taskType
    const res = await getTaskTypedOverview(taskType as OverViewType)

    fillResponse(ctx, true, res)
    await next()
  })
  router.post('/get_external_cluster_overview', async (ctx, next) => {
    const res = await getExternalClusterOverview()
    fillResponse(ctx, true, res)
    await next()
  })
  router.post('/get_external_task_count', async (ctx, next) => {
    const res = await getExternalTaskCount()
    fillResponse(ctx, true, res)
    await next()
  })

  // 获取用户超过 quota 的 tasks
  router.post('/quota_exceeded_tasks', async (ctx, next) => {
    const user_name = (await getUserInfo(ctx.request.headers.token as string))?.user_name
    if (!user_name) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }
    const tasks = await UserOutOfQuotaConsumer.getInstance().getUserData(user_name)
    fillResponse(ctx, true, tasks || [])
    await next()
  })

  router.post('/get_report_data', async (ctx, next) => {
    const params = ctx.request.body as GetReportDataBody
    const user_name = (await getUserInfo(ctx.request.headers.token as string))?.user_name
    if (!user_name) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }

    let dateStr
    if (params.dateType === 'last') {
      dateStr = getLastDateStr(params.DatePeriod)
    } else {
      dateStr = params.dateStr!
    }

    const userData = await GetReportConsumerInstance(params.DatePeriod).getData(
      params.taskType,
      dateStr!,
      user_name,
    )
    // userData 可能为空的，但是为空不应该报错
    fillResponse(ctx, true, {
      reportData: userData,
      dateStr,
    })
    await next()
  })

  router.post('/get_report_data_list', async (ctx, next) => {
    const params = ctx.request.body as GetReportDataListBody
    const user_name = (await getUserInfo(ctx.request.headers.token as string))?.user_name
    if (!user_name) {
      fillResponse(ctx, false, null, 'user not found')
      return
    }
    let dateStrList: string[] = []

    if (params.dateType === 'certain') {
      dateStrList = params.dateStrList!
    } else {
      dateStrList = getLastNDateStrings(params.DatePeriod, params.dateCount!)
      dateStrList.reverse() // hint: 由近到远 -> 由远到近
    }

    const userData = await GetReportConsumerInstance(params.DatePeriod).getDataList(
      params.taskType,
      dateStrList!,
      user_name,
    )

    fillResponse(ctx, true, userData)
    await next()
  })

  router.post('/get_node_usage_series', async (ctx, next) => {
    const type = ctx.request.query.type as OverViewType | 'external' | undefined
    if (!type) {
      fillResponse(ctx, false, null, 'Need param: type')
      return
    }
    const series = await getUsageSeries(type)
    fillResponse(ctx, true, series)
    await next()
  })
  router.post('/get_external_usage_summary', async (ctx, next) => {
    const type = ctx.request.query.type as 'user' | 'group'
    const userInstance = await getUserInfo(ctx.request.headers.token as string)
    const user_name = userInstance?.user_name
    const shared_group = userInstance?.shared_group
    if (!type) {
      fillResponse(ctx, false, null, 'Need param: type')
      return
    }
    const content = await externalTotalGpuHourConsumerInstance.readFromDisk(
      'last',
      type === 'user'
        ? ReportFileType.EXTERNAL_TOTAL_GPU_USER
        : ReportFileType.EXTERNAL_TOTAL_GPU_GROUP,
    )
    let totalUsed

    if (type === 'user') {
      if (!user_name) {
        fillResponse(ctx, false, null, 'No such user')
        return
      }
      totalUsed = content.data?.filter(
        (item: DataUsageSummaryResult['data']) => item!.user_name === user_name,
      )[0]
      fillResponse(ctx, true, { date: content.dateRange, data: totalUsed ?? null })
      next()
    } else {
      if (!shared_group) {
        fillResponse(ctx, false, null, 'No such shared_group')
        return
      }
      totalUsed = content.data?.filter(
        (item: DataUsageSummaryResult['data']) => item!.shared_group === shared_group,
      )[0]
      fillResponse(ctx, true, { date: content.dateRange, data: totalUsed ?? null })
      next()
    }
  })

  router.post('/user_node_quota_info', async (ctx, next) => {
    if (ctx.request.headers['x-custom-host']) {
      // 测试环境下，反正也拿不到 used，就先不展示了
      fillResponse(ctx, true, {
        total: {
          node: {},
          node_limit: {},
        },
        used: {},
      })
      return
    }

    const user_name = (await getUserInfo(ctx.request.headers.token as string, ctx.request.headers))
      ?.user_name

    const force = !!(ctx.request.query as UserNodeQuotaInfoParams).force

    if (!user_name) {
      fillResponse(ctx, false, null, 'User not Found')
      return
    }

    const user_node_quota = await getSingleUserQuota(user_name, force)
    fillResponse(ctx, true, user_node_quota)
    await next()
  })

  // 这个时候给之前的 jupyter 用的，后面可以考虑删除，目的是给集群 get_worker_user_info 下线做准备
  router.post('/get_worker_user_info_legacy', async (ctx, next) => {
    if (ctx.request.headers['x-custom-host']) {
      // 测试环境下，反正也拿不到 used，就先不展示了
      fillResponse(ctx, true, {
        all_quota: {},
        already_used_quota: {},
        quota: {},
        quota_limit: {},
      })
      return
    }

    const res = getWorkerUserInfoLegacy(ctx.request.headers.token as string)
    fillResponse(ctx, true, res)
    await next()
  })

  // 单个外部用户的 storage usage
  router.post('/external_user_storage_usage', async (ctx, next) => {
    const user_name = (await getUserInfo(ctx.request.headers.token as string, ctx.request.headers))
      ?.user_name

    if (!user_name) {
      fillResponse(ctx, false, 'user not found')
      return
    }

    const storageUsage = await getUserStorageUsage(user_name)
    fillResponse(ctx, true, {
      usage: storageUsage,
    })
    await next()
  })
}

export default register
