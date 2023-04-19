import { AdminGroup, MonitorCanAdminGroups, UserRole } from '@hai-platform/shared'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ApiServerApiName, apiServerClient } from '@/services'
import { logger } from '@/utils'
import { getCurrentClusterServerURL } from '../config'

interface AuthState {
  username: string
  user_group: string[]
  token: string
  isTokenValid: boolean
  shouldRememberMe: boolean
  authBaseServer: string
}

const defaultAuthState: AuthState = {
  username: '',
  user_group: [],
  token: '',
  isTokenValid: false,
  shouldRememberMe: true,
  authBaseServer: '',
}

const authStorage = useStorage<AuthState>('auth-storage', defaultAuthState)

const resetAuthStorage = (shouldRememberMe: boolean): void => {
  authStorage.value = {
    ...defaultAuthState,
    shouldRememberMe,
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...defaultAuthState,
    ...authStorage.value,
  }),

  getters: {
    /**
     * 是否有任何管理员权限
     */
    isAdmin: (state) => MonitorCanAdminGroups.some((g) => state.user_group.includes(g)),
  },

  actions: {
    /**
     * 更新权限状态
     */
    updateAuth(state: AuthState) {
      this.$state = state

      // 根据 shouldRememberMe 更新 authStorage
      if (state.shouldRememberMe) {
        authStorage.value = state
      } else {
        resetAuthStorage(state.shouldRememberMe)
      }
    },

    /**
     * 更新用户组列表
     */
    updateUserGroup(group: string[]) {
      this.user_group = group
      authStorage.value.user_group = group
    },

    /**
     * 检查是否有用户组，也可以使用 v-permission directive
     */
    checkUserGroup(group: string | string[]) {
      if (this.user_group.includes(AdminGroup.ROOT)) return true
      if (group instanceof Array) {
        return group.some((g) => this.user_group.includes(g))
      }
      return this.user_group.includes(group)
    },

    /**
     * 调用接口校验并更新权限状态
     */
    async checkAuth(params: Pick<AuthState, 'username' | 'token'>) {
      try {
        const userInfo = await apiServerClient.request(ApiServerApiName.GET_USER, {
          token: params.token,
        })
        if (params.username !== userInfo.user_name) throw Error('用户名和密码不匹配')
        if (userInfo.role === UserRole.EXTERNAL) throw Error('用户所在组没有登录权限')
        this.updateAuth({
          username: userInfo.user_name,
          user_group: userInfo.user_group,
          token: params.token,
          isTokenValid: true,
          shouldRememberMe: this.shouldRememberMe,
          authBaseServer: getCurrentClusterServerURL(),
        })
      } catch (err) {
        logger.error(err)
        this.logout()
        return false
      }

      return true
    },

    /**
     * 用户登出，保持当前的 shouldRememberMe 状态
     */
    logout() {
      this.updateAuth({
        ...defaultAuthState,
        shouldRememberMe: this.shouldRememberMe,
      })
    },
  },
})
