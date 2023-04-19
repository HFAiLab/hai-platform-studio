import type { Context, Next } from 'koa'
import type Koa from 'koa'
import { apiCounter, apiHistogram, register } from '../base/metrics'

const hostName = process.env.KUBERNETES_SERVICE_HOST || 'unknown' // unknown 一般意味着 localhost

export function MetricsReport() {
  return async (ctx: Context, next: Next) => {
    // 路径 /metrics 为监控指标 route, 返回指标
    if (ctx.path === '/metrics') {
      ctx.set('Content-Type', register.contentType)
      ctx.body = await register.metrics()
      return
    }
    await next()
  }
}

export function MetricsCounter() {
  return async (ctx: Context, next: Next) => {
    // 路径 /metrics 为监控指标 route, 返回指标
    if (ctx.path === '/metrics') {
      return
    }

    if (ctx.path === '/') {
      next()
      return
    }

    // 其他路由均统计指标
    try {
      await next()
    } finally {
      const labels = {
        path: ctx.path,
        method: ctx.method,
        status: ctx.status,
        hostName,
      }
      apiCounter.inc(labels, 1)
    }
  }
}

const hrtime2ms = (hrtime: number[]) => (hrtime[0]! * 1e9 + hrtime[1]!) / 1e6 // hrtime 转化成 ms

export function MetricsCost() {
  return async (ctx: Context, next: Next) => {
    // 路径 /metrics 为监控指标 route, 返回指标
    if (ctx.path === '/metrics') {
      return
    }

    if (ctx.path === '/') {
      next()
      return
    }

    // 其他路由均统计指标
    const start = process.hrtime() // 开始时间
    try {
      await next()
    } finally {
      const dur = hrtime2ms(process.hrtime(start)) // 计算请求处理时间
      const labels = {
        path: ctx.path,
        method: ctx.method,
        status: ctx.status,
        hostName,
      }
      apiHistogram.observe(labels, dur) // 统计响应时间
    }
  }
}

export function initMetricsMiddleware(app: Koa) {
  app.use(MetricsReport())
  app.use(MetricsCounter())
  app.use(MetricsCost())
}
