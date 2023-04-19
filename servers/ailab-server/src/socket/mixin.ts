import { Logger } from '@hai-platform/io-frontier/lib/cjs/schema/logger'
import { MetricOP } from '@hai-platform/io-frontier/lib/cjs/server/frontier'
import type { ErrorExtraInfo } from '@hai-platform/io-frontier/lib/cjs/server/frontier'
import type { SubscribeCommands } from '@hai-platform/studio-schemas/lib/cjs/socket'
import { SocketFatalError } from '@hai-platform/studio-schemas/lib/cjs/socket'
import type { AxiosRequestConfig } from 'axios'
import type { Server } from 'socket.io'
import type { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { logger } from '../base/logger'
import { Timer } from '../base/timer'
import { FRONTIER_NS, GlobalConfig } from '../config'
import { FetionMonitorType, serverMonitor } from '../monitor'
import { skipToken } from '../utils/url'
import { GaugeType, gaugeMetrics, intervalMetrics } from './metrics'

export enum ExtraInfoType {
  requestError = 'requestError',
}

export interface ExtraInfoRequestError {
  errorType: ExtraInfoType.requestError
  config: AxiosRequestConfig
}

class SocketLogger extends Logger {
  trace(message: any, ...args: any[]) {
    logger.trace('[io-frontier]', message, ...args)
  }

  debug(message: any, ...args: any[]) {
    logger.debug('[io-frontier]', message, ...args)
  }

  info(message: any, ...args: any[]) {
    logger.info('[io-frontier]', message, ...args)
  }

  warn(message: any, ...args: any[]) {
    logger.warn('[io-frontier]', message, ...args)
  }

  error(message: any, ...args: any[]) {
    logger.error('[io-frontier]', message, ...args)
  }
}

export const getConfigMixin = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  command: SubscribeCommands,
) => {
  return {
    setInterval(callback: (args: void) => void, ms?: number) {
      return Timer.setInterval(callback, ms ?? 0, `Socket:${command}`)
    },
    clearInterval(timerId: NodeJS.Timer) {
      return Timer.clearInterval(timerId)
    },
    redisUrl: GlobalConfig.STUDIO_BFF_REDIS,
    redisDatabase: GlobalConfig.BFF_REDIS_DB,
    ns: FRONTIER_NS,
    metricReport: (roomId: string, reportCommand: string, op: MetricOP) => {
      logger.info(`[metrics] roomId:${roomId}, command: ${reportCommand} op:${op}`)
      if (op === MetricOP.sub || op === MetricOP.unsub) {
        const labels = {
          command: reportCommand,
          type: GaugeType.moduleRegister,
        }
        if (op === MetricOP.sub) {
          logger.info(`gaugeMetrics inc labels: ${JSON.stringify(labels)}, 1`)
          gaugeMetrics.inc(labels, 1)
        }
        if (op === MetricOP.unsub) {
          logger.info(`gaugeMetrics dec labels: ${JSON.stringify(labels)}, 1`)
          gaugeMetrics.dec(labels, 1)
        }
      }
      if (op === MetricOP.intervalAdd || op === MetricOP.intervalRemove) {
        const labels = {
          command: reportCommand,
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        op === MetricOP.intervalAdd && intervalMetrics.inc(labels, 1)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        op === MetricOP.intervalRemove && intervalMetrics.dec(labels, 1)
      }
    },
    logger: new SocketLogger(),
    fatalErrorHandler(e: Error, extraInfo: ErrorExtraInfo) {
      let errorMsg = `${extraInfo.ioCommand}: ${e.message}`
      let url = ''
      try {
        // 这里做了一个鸭子辩形的测试，不是很准确，所以 try catch 一下
        if ((e as any).config && (e as any).request) {
          const error = e as unknown as ExtraInfoRequestError
          url = `${skipToken(error.config.url || '')}`
          errorMsg += `\n${error.config.method}: ${skipToken(
            error.config.url || '',
          )}, params: ${skipToken(new URLSearchParams(error.config.params || {}).toString())}`
        }
      } catch (e2) {
        this.logger.error('handle msg error:', e2)
      }

      logger.info('fatalErrorHandler url:', url)
      // hint: 如果用户连续报错，可能断开之后再链接第一次就会报 Fatal 错误了
      // 这个原因是断开之前可能已经有错误了

      const fatal = serverMonitor.reportV2SocketRequestError({
        monitorType: FetionMonitorType.SOCKET_REQUEST,
        keyword: url || 'unknown_url',
        content: errorMsg,
      })
      if (fatal && !extraInfo.skipIoEmitFatal) {
        this.logger.error('emit SocketFatalError')
        if (extraInfo.queryId) {
          // hint: 针对这个错误相关的客户端，发送 Fatal
          io.to(extraInfo.queryId).emit(SocketFatalError)
          io.to(extraInfo.queryId)
            .allSockets()
            .then((allSockets) => {
              logger.error(`emit ioFatalError to ${allSockets}\n\n\n`)
            })
        } else {
          io.emit(SocketFatalError)
          logger.error(`emit ioFatalError to All\n\n\n`)
          serverMonitor.reportV2SocketRequestError({
            monitorType: FetionMonitorType.SOCKET_REQUEST,
            keyword: url || 'all_url',
            content: `emit ioFatalError to All client`,
          })
        }
      }
      return fatal
    },
  }
}
