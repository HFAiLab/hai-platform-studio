import { AdminGroup, UserRole } from '@hai-platform/shared'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { getAllUsers } from '../../base/users'

function register(router: Router) {
  router.post('/get_all_internal_external_user_name', async (ctx, next) => {
    // 获取全部内部或者外部用户的内容
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    const groups = userInfo?.user_group || []
    if (!groups.includes(AdminGroup.ROOT) && !groups.includes(AdminGroup.HUB_ADMIN)) {
      fillResponse(ctx, false, 'not allowed')
      return
    }

    const users = await getAllUsers()

    const result = {
      external: [] as string[],
      internal: [] as string[],
    }

    for (const u of users) {
      if (u.role === UserRole.INTERNAL) {
        result.internal.push(u.user_name)
      } else {
        result.external.push(u.user_name)
      }
    }

    fillResponse(ctx, true, result)
    await next()
  })
}

export default register
