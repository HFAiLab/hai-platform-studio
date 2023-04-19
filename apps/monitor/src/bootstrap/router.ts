import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentClusterServerURL } from '@/config'
import { useAuthRouter, useAuthStore } from '@/stores'
import { routes } from '../routes'

export const bootstrapRouter = (app: App): void => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  const authRouterStore = useAuthRouter()
  authRouterStore.initAuthRouters(router.getRoutes())

  router.beforeEach((to, from, next) => {
    if (to.meta.skipAuth) {
      return next()
    }
    if (useAuthStore().authBaseServer === getCurrentClusterServerURL()) {
      if (useAuthStore().isTokenValid) {
        return next()
      }
      useAuthStore()
        .checkAuth({ username: useAuthStore().username, token: useAuthStore().token })
        .then((valid) => valid && next())
    }

    return next({ name: 'login' })
  })
  app.use(router)
}
