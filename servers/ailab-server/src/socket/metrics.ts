import client from 'prom-client'
import { register } from '../base/metrics'

export enum GaugeType {
  connection = 'connection',
  moduleRegister = 'moduleRegister',
}

export const gaugeMetrics = new client.Gauge({
  name: 'ailab_server_socket_command_metrics',
  help: 'Gauge of socket info',
  labelNames: ['command', 'type'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

export const connectionMetrics = new client.Gauge({
  name: 'ailab_server_socket_connection_metrics',
  help: 'socket connections',
  labelNames: ['type'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

export const intervalMetrics = new client.Gauge({
  name: 'ailab_server_socket_intervals',
  help: 'the current intervals of socket',
  labelNames: ['command'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

export const serdeErrorCounter = new client.Counter({
  name: 'ailab_server_serde_error_counter',
  help: 'Count of serde error',
  labelNames: ['module'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

// 和长链接有关的 请求和响应耗时
export const ioHistogram = new client.Histogram({
  name: 'ailab_server_socket_request_cost',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['path'],
  buckets: [
    50, 100, 300, 500, 1000, 2000, 4000, 6000, 8000, 1e4, 2e4, 3e4, 4e4, 5e4, 1e5, 2e5, 10e5,
  ], // buckets 单位 ms
  registers: [register], // specify a non-default registry
})
