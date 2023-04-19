import type Router from 'koa-router'
import { GlobalHaiHTMLManager } from '../../biz/hai/html'

function register(router: Router) {
  router.get('/hai_config.js', async (ctx, next) => {
    const haiConfig = GlobalHaiHTMLManager.getHaiConfig()
    ctx.set('Content-Type', 'application/javascript')
    ctx.response.body = `window.haiConfig = ${JSON.stringify(haiConfig)}`
    await next()
  })
}

export default register
