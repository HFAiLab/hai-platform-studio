import fs from 'fs'
import http from 'http'
import path from 'path'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/cjs/date/utils'
import TOML from '@iarna/toml'
import cors from '@koa/cors'
import deepMerge from 'deepmerge'
import Koa from 'koa'
import koaBody from 'koa-body'
import Router from 'koa-router'
import staticServe from 'koa-static'
import { Server } from 'socket.io'
import { logger } from './base/logger'
import { GlobalAggFetion } from './biz/agg-fetion'
import { GlobalHaiHTMLManager } from './biz/hai/html'
import type { PartialTomlConfig } from './config'
import { GlobalConfig } from './config'
import { HLogger } from './middleware/logger'
import { initMetricsMiddleware } from './middleware/metrics'
import { registerRouterWithPrefix } from './routes'
import { SocketHandler } from './socket'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json')

const app = new Koa()
const server = http.createServer(app.callback())
const io = new Server(server, {
  cors: {
    origin: '*', // hint: 这里我们交由外层代理来处理，因此不做限制，如果直接暴露在外网中，建议调整此配置
  },
})

// 日志：
app.use(HLogger())

/**
 * 可能在这里需要拦截一下，注入 json
 */
app.use(async (ctx, next) => {
  if (GlobalConfig.ENABLE_ONLINE_DEBUG) logger.info('[api] receive request path', ctx.req.url)
  if (GlobalConfig.STUDIO_DISABLE_STATIC_SERVE) {
    await next()
    return
  }
  try {
    if (ctx.request.path === '/') {
      const htmlContent = await GlobalHaiHTMLManager.renderRootHTML('index.html', 'studio')
      ctx.response.body = htmlContent
      ctx.response.status = 200
      return
    }
    if (ctx.request.path === '/monitor' || ctx.request.path === '/monitor/index.html') {
      const htmlContent = await GlobalHaiHTMLManager.renderRootHTML('monitor/index.html', 'monitor')
      ctx.response.body = htmlContent
      ctx.response.status = 200
      return
    }
  } catch (e) {
    // do nothing: 可能并没有静态 serve 文件
  }
  await next()
})

// ailab-server 根目录
app.use(staticServe(path.join(__dirname, '../public')))

app.use(
  koaBody({
    jsonLimit: '10mb',
    multipart: true,
  }),
)

// 首页路由
const router = new Router()
router.get('/', (ctx) => {
  ctx.response.body = `Ailab-Server BFF [current env:${
    process.env.NODEJS_ENV || 'local-test'
  } version: ${version}]`
})

// 跨域处理：因为代理把 origin 改成空了，所以这里需要指定一下是 *，但如果直接暴露在外网中，建议调整此配置
app.use(
  cors({
    origin: '*',
  }),
)

// 监控：
initMetricsMiddleware(app)

app.use(router.routes())
registerRouterWithPrefix(app)

// metrics:
SocketHandler(io)

// hint: 默认的 server timeout 是 0，即不设置超时
// 目前 nginx 的 keep-alive 时间是 75 秒，所以我们要设置的比他大
// https://github.com/nodejs/node/issues/27363
// Ensure all inactive connections are terminated by the ALB, by setting this a few seconds higher than the ALB idle timeout
server.keepAliveTimeout = 79 * 1000
// Ensure the headersTimeout is set higher than the keepAliveTimeout due to this nodejs regression bug: https://github.com/nodejs/node/issues/27363
server.headersTimeout = 80 * 1000

// 监听端口
server.listen(GlobalConfig.STUDIO_PORT, () => {
  logger.info(
    `\n\n[ailab-server start] begin listening on *: ${GlobalConfig.STUDIO_PORT}, version: ${version}`,
  )
})

process.on('unhandledRejection', (reason, promise) => {
  logger.warn('err!unhandledRejection')
  logger.warn('unhandledRejection reason', reason)
  logger.warn('unhandledRejection promise', promise)
})

// 未捕获的错误
process.on('uncaughtException', (err) => {
  logger.fatal('\n\nerr!uncaughtException')
  logger.fatal(err)
  logger.fatal(err.stack)
  process.exit(1) // 强制性的（根据 Node.js 文档）
})

setInterval(() => {
  // live log
  logger.info('[bff] live heartbeat')
}, 5 * ONEMINUTE)

logger.info('ailab-server start GlobalConfig:', GlobalConfig)
logger.info('process.env.MARSV2_MANAGER_CONFIG_DIR:', process.env.MARSV2_MANAGER_CONFIG_DIR)
let tomlConfig: PartialTomlConfig = {}

if (process.env.MARSV2_MANAGER_CONFIG_DIR) {
  logger.info('MARSV2_MANAGER_CONFIG_DIR:', process.env.MARSV2_MANAGER_CONFIG_DIR)
  for (const fileName of ['core.toml', 'scheduler.toml', 'extension.toml', 'override.toml']) {
    const filePath = path.join(process.env.MARSV2_MANAGER_CONFIG_DIR, fileName)
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      tomlConfig = deepMerge(tomlConfig, TOML.parse(fileContent))
    }
  }
}

/**
 * 聚合错误的消费者，应该只有 pod 满足特定条件的情况才启动
 */
const hostName = process.env.HOSTNAME

if (!hostName || hostName.includes('agg-fetion')) {
  GlobalAggFetion.startFilter()
  GlobalAggFetion.startHandler()
}
