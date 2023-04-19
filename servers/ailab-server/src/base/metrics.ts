import client from 'prom-client'

const { collectDefaultMetrics } = client
const { Registry } = client
export const register = new Registry()

collectDefaultMetrics({ register })

// const hostName = process.env.KUBERNETES_SERVICE_HOST || 'unknown' // unknown 一般意味着 localhost

// 基于 axios 的请求 API 统计，这里的 API 都是长链接过来的
export const axiosApiCounter = new client.Counter({
  name: 'ailab_server_axios_api_count',
  help: 'Count of axios apis(without proxy)',
  labelNames: ['path', 'host'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

export const globalTimeoutMetrics = new client.Counter({
  name: 'ailab_server_global_timeout_metrics',
  help: 'global timeout count',
  labelNames: ['tag'],
  registers: [register],
})

export const globalIntervalMetrics = new client.Gauge({
  name: 'ailab_server_global_interval_metrics',
  help: 'global interval current number',
  labelNames: ['tag'],
  registers: [register],
})

// 所有 bff 的请求数量
export const apiCounter = new client.Counter({
  name: 'ailab_server_api_count',
  help: 'Count of all api routes',
  labelNames: ['path', 'method', 'status', 'hostName'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

// 所有 bff 的请求时间统计
export const apiHistogram = new client.Histogram({
  name: 'ailab_server_api_request_cost',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['path', 'method', 'status', 'hostName'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 1e4, 5e4, 1e5, 2e5, 10e5], // buckets 单位 ms
  registers: [register], // specify a non-default registry
})

// 基于 axios 的请求 API 统计，这里的 API 都是长链接过来的
export const api500Counter = new client.Counter({
  name: 'ailab_server_axios_api_500_count',
  help: 'Count of 500 apis',
  labelNames: ['path'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})
