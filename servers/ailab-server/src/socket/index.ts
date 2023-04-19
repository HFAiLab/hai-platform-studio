import { preInit } from '@hai-platform/io-frontier/lib/cjs/server'
import type {
  ForceRefreshReq,
  TokenMixin,
  URLMixin,
} from '@hai-platform/studio-schemas/lib/cjs/socket'
import {
  FrontierForceRefresh,
  InvokeSocketFatalError,
  SocketFatalError,
  SubscribeCommands,
} from '@hai-platform/studio-schemas/lib/cjs/socket'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { ifAuth } from '../base/auth'
import { logger } from '../base/logger'
import { GaugeType, connectionMetrics } from './metrics'
import { GetClusterSubscribeHandlerInstance2 } from './module/cluster2'
import { GetExpSubscribeHandlerInstance2 } from './module/exp2'
import { GetExpsSubscribeHandlerInstance2 } from './module/exps2'
import { GetLogSubscribeHandlerInstance } from './module/log'
import { GetNodeUsageSeriesSubscribeHandlerInstance } from './module/nodeUsageSeries'
import { GetServiceTasksSubscribeHandlerInstance } from './module/serviceTasks'
import { GetSysLogSubscribeHandlerInstance } from './module/sysLog'
import { GetTaskCurrentPerf2SubscribeHandlerInstance } from './module/taskCurrentPerf2'
import { GetTasksSubscribeHandlerInstance2 } from './module/tasks2'

export function SocketHandler(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
  // socket 连接
  io.use(async (socket, next) => {
    const auth = socket.handshake.auth as TokenMixin & URLMixin
    const authed = await ifAuth(auth)
    if (!authed) {
      next(new Error('Invalid Auth'))
    } else {
      next()
    }
  })

  const ClusterSubscribeHandlerInstance2 = GetClusterSubscribeHandlerInstance2(io)
  const TasksSubscribeHandlerInstance2 = GetTasksSubscribeHandlerInstance2(io)
  const ExpsSubscribeHandlerInstance2 = GetExpsSubscribeHandlerInstance2(io)
  const ExpSubscribeHandlerInstance2 = GetExpSubscribeHandlerInstance2(io)
  const TaskCurrentPerf2SubscribeHandlerInstance = GetTaskCurrentPerf2SubscribeHandlerInstance(io)
  const LogSubscribeHandlerInstance = GetLogSubscribeHandlerInstance(io)
  const SysLogSubscribeHandlerInstance = GetSysLogSubscribeHandlerInstance(io)
  const NodeUsageSeriesSubscribeHandlerInstance = GetNodeUsageSeriesSubscribeHandlerInstance(io)
  const ServiceTasksSubscribeHandlerInstance = GetServiceTasksSubscribeHandlerInstance(io)

  io.on('connection', (socket) => {
    logger.info('[socket] user connected:', socket.id, socket.handshake.auth.token)
    socket.emit('connection', socket.id)
    preInit(socket)

    ClusterSubscribeHandlerInstance2.register(io, socket)
    TasksSubscribeHandlerInstance2.register(io, socket)
    ExpsSubscribeHandlerInstance2.register(io, socket)
    ExpSubscribeHandlerInstance2.register(io, socket)
    TaskCurrentPerf2SubscribeHandlerInstance.register(io, socket)
    LogSubscribeHandlerInstance.register(io, socket)
    SysLogSubscribeHandlerInstance.register(io, socket)
    NodeUsageSeriesSubscribeHandlerInstance.register(io, socket)
    ServiceTasksSubscribeHandlerInstance.register(io, socket)

    socket.on(InvokeSocketFatalError, () => {
      socket.emit(SocketFatalError)
    })

    socket.on(FrontierForceRefresh, (data: any) => {
      logger.info('get FrontierForceRefresh', JSON.stringify(data)) // 先 stringify 一下，可以减少行数
      if (data.command === SubscribeCommands.ClusterOverview2) {
        ClusterSubscribeHandlerInstance2.expireData(
          (data as ForceRefreshReq<SubscribeCommands.ClusterOverview2>).query,
        )
      }
      if (data.command === SubscribeCommands.TaskOverview2) {
        TasksSubscribeHandlerInstance2.expireData(
          (data as ForceRefreshReq<SubscribeCommands.TaskOverview2>).query,
        )
      }
      if (data.command === SubscribeCommands.Experiments2) {
        ExpsSubscribeHandlerInstance2.expireData(
          (data as ForceRefreshReq<SubscribeCommands.Experiments2>).query,
        )
      }
      if (data.command === SubscribeCommands.Experiment2) {
        ExpSubscribeHandlerInstance2.expireData(
          (data as ForceRefreshReq<SubscribeCommands.Experiment2>).query,
        )
      }
      if (data.command === SubscribeCommands.TaskCurrentPerf2) {
        TaskCurrentPerf2SubscribeHandlerInstance.expireData(
          (data as ForceRefreshReq<SubscribeCommands.TaskCurrentPerf2>).query,
        )
      }
      if (data.command === SubscribeCommands.Log) {
        LogSubscribeHandlerInstance.expireData(
          (data as ForceRefreshReq<SubscribeCommands.Log>).query,
        )
      }
      if (data.command === SubscribeCommands.SysLog) {
        SysLogSubscribeHandlerInstance.expireData(
          (data as ForceRefreshReq<SubscribeCommands.SysLog>).query,
        )
      }
      if (data.command === SubscribeCommands.NodeUsageSeries) {
        NodeUsageSeriesSubscribeHandlerInstance.expireData(
          (data as ForceRefreshReq<SubscribeCommands.NodeUsageSeries>).query,
        )
      }
      if (data.command === SubscribeCommands.ServiceTasks) {
        ServiceTasksSubscribeHandlerInstance.expireData(
          (data as ForceRefreshReq<SubscribeCommands.ServiceTasks>).query,
        )
      }
    })

    connectionMetrics.inc(
      {
        type: GaugeType.connection,
      },
      1,
    )

    socket.on('disconnect', () => {
      logger.info('[socket] user disconnected:', socket.id)

      const labels = {
        type: GaugeType.connection,
      }
      connectionMetrics.dec(labels, 1)
    })
  })
}
