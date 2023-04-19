import { resolve } from 'path'
import fs from 'fs-extra'
import type { Context, Next, ParameterizedContext } from 'koa'
import type Koa from 'koa'
// @ts-expect-error for this module
import compose from 'koa-compose'
import Router from 'koa-router'
// @ts-expect-error for this module
import { hyphen, snake } from 'naming-style'
import { getUserInfo } from '../base/auth'
import { logger } from '../base/logger'
import { isProd } from '../config'
import { RouteRegisterConfig } from './config'

export function fillResponse(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>,
  success: boolean,
  data: unknown,
  msg?: string,
) {
  ctx.response.body = {
    success,
    data,
    msg,
  }
}

// 获取目录下所有路由文件：
function getSubDirFiles(dir: string) {
  try {
    const files = fs
      .readdirSync(resolve(__dirname, `./${dir}/`))
      .filter((value: any) => value.indexOf('index') === -1 && !/\.d\.ts$/.test(`${value}`))
      .filter((value) => /\.(js|ts)$/.test(value))
    return files
  } catch (e) {
    // 如果是经过裁剪的 bff，是找不到部分路由的，是正常情况
    return []
  }
}

const routerMap = new Map()
// hint: 文件夹名用短横线，但是路由会转成下划线，文件名用大写
for (const routerConfig of RouteRegisterConfig) {
  routerMap.set(snake(routerConfig.dir), { auth: routerConfig.auth })
}

export function registerRouterWithPrefix(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
  const routers: any = []

  for (const [dir] of routerMap.entries()) {
    const files = getSubDirFiles(hyphen(dir))
    for (const file of files) {
      const fileName = file.replace(/\.(js|ts)$/, '')
      if (isProd() && fileName.includes('dev')) {
        continue
      }
      const router = new Router()
      logger.info('router registered:', `/${snake(dir)}/${snake(fileName)}`)
      router.prefix(`/${snake(dir)}/${snake(fileName)}`)
      // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
      const registerFn = require(resolve(__dirname, './', hyphen(dir), file)).default
      registerFn(router)
      routers.push(router.routes())
      routers.push(router.allowedMethods())
    }
  }

  const dirNames = [...routerMap.keys()]
  const dirNameRegex = new RegExp(`/(${dirNames.join('|')})`)

  app.use(async (ctx: Context, next: Next) => {
    function judgeAuthGroup(group_list: string[], auth: string[] | false) {
      if (!auth) return true
      for (const groupName of auth) {
        if (group_list.includes(groupName)) return true
      }
      return false
    }

    if (dirNameRegex.test(ctx.request.path)) {
      const info = routerMap.get(ctx.request.path.match(dirNameRegex)![1])
      if (info && info.auth) {
        const userInfo = await getUserInfo(ctx.request.headers.token as string, ctx.request.headers)
        if (!userInfo || !judgeAuthGroup(userInfo.group_list, info.auth)) {
          ctx.response.body = '403 Not Allowed'
          ctx.status = 403
          return
        }
      }
    }
    await next()
  })

  // hint: proxy 不做鉴权
  const proxy = new Router()
  proxy.prefix('/proxy')
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require('./proxy').default(proxy)
  routers.push(proxy.routes())
  routers.push(proxy.allowedMethods())

  app.use(compose(routers))
}
