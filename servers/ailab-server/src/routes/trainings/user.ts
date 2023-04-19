import { AdminGroup, CanAdminGroups, UserRole } from '@hai-platform/shared'
import type { StudioUser } from '@hai-platform/studio-schemas/lib/cjs/isomorph/user/info'
import type Router from 'koa-router'
import { fillResponse } from '..'
import { getUserInfo } from '../../base/auth'
import { axiosNoCache } from '../../base/axios'
import { logger } from '../../base/logger'
import { getAllUsers } from '../../base/users'
import { GlobalConfig } from '../../config'
import { HFSequelize } from '../../orm'
import { groupChecker } from '../../utils/permission'

// 可以获取用户名与真名对照等信息的组
const nicknameGroups = [
  AdminGroup.EXTERNAL_QUOTA_EDITOR,
  AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR,
  AdminGroup.YINGHUO_STATUS_VIEWER,
  AdminGroup.YINGHUO_STATUS_VIEWER_EXT_ONLY,
] as const

// 但是该组只能拿外部用户的名字对照
const onlyExternalNicknameGroups = [AdminGroup.ONLY_EXTERNAL_NICKNAME]

function register(router: Router) {
  router.post('/check_user', async (ctx, next) => {
    const query = ctx.request.body
    const { token, name } = query
    const url = `${GlobalConfig.CLUSTER_SERVER_URL}/query/get_user_info/${token}/jd`
    try {
      const res = await axiosNoCache.get(url)
      fillResponse(ctx, true, {
        match: res.data.user_info.user_name === name,
        token,
        name,
      })
    } catch (e) {
      logger.info('check_user error:', e)
      fillResponse(ctx, true, {
        match: false,
        token,
        name,
      })
    }

    await next()
  })

  router.post('/safe_get_user_info', async (ctx, next) => {
    const query = ctx.request.body
    const { token, name } = query
    // groupList 中包含以下分组的，认为有 admin 权限
    const user_info = (await getUserInfo(token, ctx.request.headers)) as StudioUser | null

    if (!user_info || user_info.user_name !== name) {
      fillResponse(ctx, true, {
        success: false,
        data: null,
      })
      return
    }
    if (await groupChecker(name, token, CanAdminGroups)) {
      user_info.admin = true
    }
    fillResponse(ctx, true, {
      success: true,
      data: user_info,
    })
    await next()
  })

  router.post('/nickname_map', async (ctx, next) => {
    const query = ctx.request.body
    const { token, name } = query

    const hasPermission = await groupChecker(name, token, nicknameGroups)
    if (!hasPermission) {
      ctx.response.status = 403
      ctx.response.body = {
        success: 0,
        msg: 'No Permission.',
      }
      return
    }

    const onlyExternal = await groupChecker(name, token, onlyExternalNicknameGroups)

    let users = await getAllUsers()

    // 可以先在 bff 层清理一下
    if (users) {
      if (onlyExternal) {
        users = users.filter((u: any) => u.role === UserRole.EXTERNAL)
      }
      // update: 避免直接去改 user，对缓存产生影响
      users = users.map((u: any) => {
        return {
          ...u,
          last_activity: undefined,
          role: undefined,
          shared_group: undefined,
          user_groups: undefined,
          user_id: undefined,
        }
      })
    }
    fillResponse(ctx, true, users)
    await next()
  })

  router.post('/cluster_message', async (ctx, next) => {
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, 'user not found')
      return
    }
    const userGroupList = [...(userInfo.group_list || []), userInfo.user_name]
    const hfSequelize = await HFSequelize.getInstance()

    const allMessagesForCurrentUser =
      await hfSequelize.clusterUserMessage.getValidMessageByGroupList(userGroupList)

    fillResponse(ctx, true, { messages: allMessagesForCurrentUser })
    await next()
  })

  // 为什么单独抽这个接口：
  // 1.如果补字段到 safe_get_user_info，需要依赖全局 user 实例刷新。且该接口历史悠久。
  // 2.之后可能有 LV 计算，用量计算之类的更多字段的扩展，有可能会越来越复杂。放这里更好维护一些。
  router.post('/about_me_info', async (ctx, next) => {
    const userInfo = await getUserInfo(ctx.request.headers.token as string)
    if (!userInfo) {
      fillResponse(ctx, false, 'user not found')
      return
    }
    const hfSequelize = await HFSequelize.getInstance()

    const userName = userInfo.user_name
    const sharedGroup = userInfo.shared_group as string

    // 拿头像
    const xTopicUserInstance = await hfSequelize.XTopicUser.get(userInfo.user_name)

    // 按需添加该字段：
    // eslint-disable-next-line no-undef-init, prefer-const
    let userCreateTime: undefined | string = ''

    fillResponse(ctx, true, {
      userName,
      sharedGroup,
      avatar: xTopicUserInstance?.avatar,
      accountCreateTime: userCreateTime,
      // 预留该字段
      level: undefined,
    })
    await next()
  })
}

export default register
