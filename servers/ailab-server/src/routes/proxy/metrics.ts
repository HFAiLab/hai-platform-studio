import client from 'prom-client'
import { register } from '../../base/metrics'

export const proxyApiCount = new client.Counter({
  name: 'ailab_server_proxy_api_count',
  help: 'Count of proxy apis',
  labelNames: ['path', 'host'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})

export const proxyErrorCount = new client.Counter({
  name: 'ailab_server_proxy_error_count',
  help: 'Count of proxy error',
  labelNames: ['path', 'host', 'errType', 'token'], // labels 为了统计分组，可以区分不同维度的指标
  registers: [register], // specify a non-default registry
})
