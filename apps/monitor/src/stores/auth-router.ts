import { defineStore } from 'pinia'
import type { RouteRecordNormalized } from 'vue-router'
import { ApiServerApiName, apiServerClient } from '@/services'
import { useAuthStore } from './auth'

interface AuthRouterState {
  /**
   * 存放应该展示到侧边栏的路由
   */
  routes: RouteRecordNormalized[]

  /**
   * 存放原始的所有路由
   */
  rawRoutes: RouteRecordNormalized[]
}

export const useAuthRouter = defineStore('auth-router', {
  state: (): AuthRouterState => ({
    routes: [],
    rawRoutes: [],
  }),

  getters: {
    authorizedRoutes(): RouteRecordNormalized[] {
      return this.routes
    },
  },

  actions: {
    /**
     * 调用接口并更新数据
     * hint: 因为我们这里只影响展示层，比如用户没有某个路由的权限，只是不展示了
     * 如果 url 直接输入，还是应该可以看到这个页面（并且提示没权限）的，否则就很可能给用户感觉像是 bug
     */
    async initAuthRouters(routes: RouteRecordNormalized[]) {
      this.rawRoutes = routes
      await this.refreshAuthRouters()
    },

    async refreshAuthRouters() {
      let resRoutes = [...this.rawRoutes]
      if (!useAuthStore().token) {
        return
      }
      const userInfo = await apiServerClient.request(ApiServerApiName.GET_USER, {
        token: useAuthStore().token,
      })
      useAuthStore().updateUserGroup(userInfo.user_group)
      // hint: 这里可以增加更多的过滤
      if (!userInfo.group_list.includes('api_dashboard')) {
        resRoutes = resRoutes.filter((route) => route.path !== '/monitor/log_overview')
      }
      this.routes = resRoutes
    },
  },
})
