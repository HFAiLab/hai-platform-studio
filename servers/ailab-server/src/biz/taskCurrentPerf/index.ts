import type {
  GetTaskCurrentPerfV2Params,
  TaskCurrentPerfStat,
} from '@hai-platform/client-ailab-server'
import type { GetTaskContainerMonitorStatsResult } from '@hai-platform/client-api-server'
import { ApiServerApiName } from '@hai-platform/client-api-server'
import { getUTC8TimeStamp } from '@hai-platform/io-frontier/lib/cjs/tools/time'
import type { ClusterUnit, TaskNodesContainerMonitorStat } from '@hai-platform/shared'
import { UserRole } from '@hai-platform/shared'
import { getUserInfo } from '../../base/auth'
import { logger } from '../../base/logger'
import { GlobalConfig } from '../../config'
import { GlobalApiServerClient } from '../../req/apiServer'
import { GlobalPromiseSingletonExecuter } from '../../utils/promise'

// cpu 和 memory 信息，60 秒更新一次
const CPU_MEM_QUERY_INTERVAL = 60 * 1000
export const CLUSTER_DF_INTERVAL = 15 * 1000

export class TaskPerfQuerier {
  cpu_mem_stats: GetTaskContainerMonitorStatsResult | null = null

  last_cpu_mem_query_time: number | null = null

  cluster_df_list: ClusterUnit[] = []

  last_cluster_df_query_time: number | null = null

  syncTasksPerf = async () => {
    try {
      const result = await GlobalApiServerClient.request(
        ApiServerApiName.GET_TASK_CONTAINER_MONITOR_STATS,
        {
          token: GlobalConfig.BFF_ADMIN_TOKEN,
        },
      )
      this.last_cpu_mem_query_time = getUTC8TimeStamp()
      this.cpu_mem_stats = result
    } catch (e) {
      logger.error('TaskPerfQuerier GET_TASK_CONTAINER_MONITOR_STATS error', e)
    }
  }

  syncClusterDF = async () => {
    logger.info('TaskPerfQuerier syncClusterDF begin')
    try {
      const clusterDFResult = await GlobalApiServerClient.request(ApiServerApiName.CLUSTER_DF, {
        token: GlobalConfig.BFF_ADMIN_TOKEN,
      })
      logger.info('TaskPerfQuerier syncClusterDF succeeded')
      this.last_cluster_df_query_time = getUTC8TimeStamp()
      this.cluster_df_list = clusterDFResult.cluster_df
    } catch (e) {
      logger.error('TaskPerfQuerier CLUSTER_DF error', e)
    }
  }

  queryClusterDf = async () => {
    if (
      !this.last_cluster_df_query_time ||
      getUTC8TimeStamp() - this.last_cluster_df_query_time > CPU_MEM_QUERY_INTERVAL
    ) {
      await GlobalPromiseSingletonExecuter.execute(this.syncClusterDF)
    }
    return this.cluster_df_list
  }

  // 如果需要定位实时问题，可以快速请求这个接口：
  // /query/task_container_monitor_stats?token=
  async queryCpuAndMemory(task_id: number) {
    if (
      !this.last_cpu_mem_query_time ||
      getUTC8TimeStamp() - this.last_cpu_mem_query_time > CPU_MEM_QUERY_INTERVAL
    ) {
      await GlobalPromiseSingletonExecuter.execute(this.syncTasksPerf)
    }

    const cpu_mem: {
      cpu: null | TaskNodesContainerMonitorStat | undefined
      mem: null | TaskNodesContainerMonitorStat | undefined
    } = { cpu: null, mem: null }
    if (this.cpu_mem_stats?.container_cpu_usage[`${task_id}`]) {
      cpu_mem.cpu = this.cpu_mem_stats.container_cpu_usage[`${task_id}`]
    }

    if (this.cpu_mem_stats?.container_memory_rss[`${task_id}`]) {
      cpu_mem.mem = this.cpu_mem_stats.container_memory_rss[`${task_id}`]
    }

    return cpu_mem
  }

  async queryGpuAndIB(task_id: number, isInternal?: boolean) {
    // 不用 execute 的话，第一次总是会有一些 ERR
    if (
      !this.last_cluster_df_query_time ||
      getUTC8TimeStamp() - this.last_cluster_df_query_time > CLUSTER_DF_INTERVAL
    ) {
      await GlobalPromiseSingletonExecuter.execute(this.syncClusterDF)
    }

    const relatedClusterUnits = this.cluster_df_list.filter((cluster_df_unit) => {
      return cluster_df_unit.working_task_id && cluster_df_unit.working_task_id === task_id
    })

    const gpu_power_data = relatedClusterUnits.reduce((previousValue, unit) => {
      previousValue[isInternal ? unit.name : `hfai-rank-${unit.working_task_rank}`] = unit.gpu_power
      return previousValue
    }, {} as TaskNodesContainerMonitorStat)

    const res = {
      // 因为有可能只订阅 p2u，但不订阅 gpu_power，防止增加过多特判增加维护难度，此处复制一份
      gpu_power: gpu_power_data,
      gpu_p2u: gpu_power_data,
      gpu_util: relatedClusterUnits.reduce((previousValue, unit) => {
        previousValue[isInternal ? unit.name : `hfai-rank-${unit.working_task_rank}`] =
          unit.gpu_util
        return previousValue
      }, {} as TaskNodesContainerMonitorStat),
      ib_rx: relatedClusterUnits.reduce((previousValue, unit) => {
        previousValue[isInternal ? unit.name : `hfai-rank-${unit.working_task_rank}`] = unit.ib_rx
        return previousValue
      }, {} as TaskNodesContainerMonitorStat),
      ib_tx: relatedClusterUnits.reduce((previousValue, unit) => {
        previousValue[isInternal ? unit.name : `hfai-rank-${unit.working_task_rank}`] = unit.ib_tx
        return previousValue
      }, {} as TaskNodesContainerMonitorStat),
    }

    if (!relatedClusterUnits.length) {
      logger.info(
        `TaskPerfQuerier queryGpuAndIB get empty relatedClusterUnits for task_id: ${task_id}`,
      )
    }

    return res
  }
}

export const GlobalTaskPerfQuerier = new TaskPerfQuerier()

const filterKeys = (keys: (keyof TaskCurrentPerfStat)[]): [string[], string[]] => {
  const cpu_mem_keys: string[] = []
  const gpu_ib_keys: string[] = []

  keys.forEach((key) => {
    if (key === 'cpu' || key === 'mem') {
      cpu_mem_keys.push(key)
    } else {
      gpu_ib_keys.push(key)
    }
  })

  return [cpu_mem_keys, gpu_ib_keys]
}

export async function getTaskCurrentPerf2(query: GetTaskCurrentPerfV2Params) {
  const result: TaskCurrentPerfStat = {}

  const [cpu_mem_keys, gpu_ib_keys] = filterKeys(query.keys || [])

  if (cpu_mem_keys.length && query.task_id) {
    const cpuAndMemory = await GlobalTaskPerfQuerier.queryCpuAndMemory(Number(query.task_id))
    cpu_mem_keys.forEach((cpu_mem_key) => {
      result[cpu_mem_key as 'cpu' | 'mem'] = cpuAndMemory[cpu_mem_key as 'cpu' | 'mem']
    })
  }

  const isInternal = query.token
    ? (await getUserInfo(query.token))?.group_list.includes(UserRole.INTERNAL)
    : false

  if (gpu_ib_keys.length && query.task_id) {
    const gpuAndIB = await GlobalTaskPerfQuerier.queryGpuAndIB(Number(query.task_id), isInternal)
    gpu_ib_keys.forEach((gpu_ib_key) => {
      result[gpu_ib_key as 'gpu_util' | 'gpu_power' | 'ib_rx' | 'ib_tx'] =
        gpuAndIB[gpu_ib_key as 'gpu_util' | 'gpu_power' | 'ib_rx' | 'ib_tx']
    })
  }

  return result
}

GlobalTaskPerfQuerier.syncTasksPerf()
