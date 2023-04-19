import type { CreateUserResult } from '@hai-platform/client-api-server'
import type { CreateUserSchema, TaskScheduleZoneConfig, User } from '@hai-platform/shared'
import { Modal, message } from 'ant-design-vue'
import { defineStore } from 'pinia'
import { h } from 'vue'
import { getUsersNameMap } from '@/data'
import { ApiServerApiName, apiServerClient } from '@/services'
import { logger } from '@/utils'
import { useAuthStore } from './auth'

interface UsersState {
  /**
   * 用户信息
   */
  users: User[]

  /**
   * 是否已初始化
   */
  isInitialized: boolean

  /**
   * 是否正在获取数据
   */
  isLoading: boolean

  /**
   * 所有出现过的用户组
   */
  userGroups: string[]
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    isInitialized: false,
    isLoading: false,
    userGroups: [],
  }),

  getters: {
    /**
     * key 为用户名，value 为 user 对象的 map
     */
    usersNameMap: (state) => getUsersNameMap(state.users),
  },

  actions: {
    /**
     * 调用接口并更新数据
     */
    async fetchData() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const users = (await apiServerClient.request(ApiServerApiName.GET_USERS, {
          token: useAuthStore().token,
        })) as User[]
        this.users = users
        this.isInitialized = true
        // 处理用户组
        const allGroups = new Set<string>()
        for (const user of users) {
          user.user_groups.forEach((g) => allGroups.add(g))
        }
        this.userGroups = [...allGroups]
      } catch (err) {
        logger.error(err)
      } finally {
        this.isLoading = false
      }
    },
    setUserActiveState(user_name: string, active: boolean) {
      const { fetchData } = this
      Modal.confirm({
        title: `[警告] ${active ? '恢复' : '禁用'}用户`,
        content: `确认要${active ? '恢复' : '禁用'}用户 [${user_name}] 吗？`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.SET_USER_ACTIVE_STATE, {
              user_name,
              active,
              token: useAuthStore().token,
            })
            message.success(msg)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response.data.msg
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
          }
        },
      })
    },
    switchScheduleZone(user_name: string, schedule_zone: TaskScheduleZoneConfig) {
      const { fetchData } = this
      Modal.confirm({
        title: '[警告] 切换调度区域',
        content: `确认要将 [${user_name}] 的所有任务切换到 [${schedule_zone}] 吗？`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.SWITCH_SCHEDULE_ZONE, {
              schedule_zone,
              user_name,
              token: useAuthStore().token,
            })
            message.success(msg)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response.data.msg
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
          }
        },
      })
    },
    updateUserGroups(user_name: string, groups: string[]) {
      const { fetchData } = this
      Modal.confirm({
        title: '[警告] 更新用户组信息',
        content: `确认要将 [${user_name}] 的用户组更新为 [${groups}] 吗？(public/internal/external 不可更改)`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.UPDATE_USER_GROUP, {
              user_name,
              groups,
              token: useAuthStore().token,
            })
            message.success(msg)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response.data.msg
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
          }
        },
      })
    },
    createUser(
      params: CreateUserSchema,
      resolve: (ret: CreateUserResult) => void,
      reject: (msg?: string) => void,
    ) {
      const { user_name, shared_group, user_id, role, nick_name, active } = params
      const lines = [
        `确认要创建用户 [${user_name}] 吗？请确认以下用户信息`,
        `用户名：${user_name}`,
        `分组：${shared_group}`,
      ]
      if (user_id) lines.push(`用户 ID: ${user_id}`)
      if (role) lines.push(`角色：${role}`)
      if (nick_name) lines.push(`用户昵称：${nick_name}`)
      if (active) lines.push(`激活状态：${active ? '激活' : '禁用'}`)
      const { fetchData } = this
      Modal.confirm({
        title: '[警告] 创建用户',
        content: h(
          'div',
          null,
          lines.map((line) => h('div', null, line)),
        ),
        async onOk() {
          try {
            const result = await apiServerClient.request(
              ApiServerApiName.CREATE_USER,
              {
                token: useAuthStore().token,
              },
              {
                data: params,
              },
            )
            message.success('创建用户成功')
            resolve(result)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response?.data?.msg ?? (err as Error).message
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
            reject(errMsg)
          }
        },
      })
    },
  },
})
