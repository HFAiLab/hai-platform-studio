import type { TaskPriority, TaskPriorityName, UserQuotaInfo } from '@hai-platform/shared'
import { AdminGroup, priorityToNumber } from '@hai-platform/shared'
import { defineStore } from 'pinia'
import { ApiServerApiName, apiServerClient } from '@/services'
import { logger } from '@/utils'
import { useAuthStore } from './auth'

export interface UserQuotaDict {
  [group: string]: {
    [user: string]: { [p: number]: { node?: number; limit?: number } }
  }
}
export interface PriorityEditFormState {
  group: string
  username: string
  priority: TaskPriorityName
  quota: number | undefined
}
interface UserQuotaState {
  /**
   * 用户信息
   */
  userQuota: UserQuotaInfo[]

  /**
   * 是否已初始化
   */
  isInitialized: boolean

  /**
   * 是否正在获取数据
   */
  isLoading: boolean

  /**
   * 所有组的列表
   */
  groupList: string[]

  /**
   * 用户信息 Dict
   */
  userQuotaDict: UserQuotaDict
}

export const useUserQuotaStore = defineStore('user-quota', {
  state: (): UserQuotaState => ({
    userQuota: [] as UserQuotaInfo[],
    isInitialized: false,
    isLoading: false,
    groupList: [],
    userQuotaDict: {},
  }),

  actions: {
    /**
     * 调用接口并更新数据
     */
    async fetchData() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        let quotas = [] as UserQuotaInfo[]
        const { user_group } = useAuthStore()
        if (user_group.includes(AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR)) {
          const internalUsers = (
            await apiServerClient.request(ApiServerApiName.GET_INTERNAL_USER_PRIORITY_QUOTA, {
              token: useAuthStore().token,
            })
          ).data
          quotas = quotas.concat(internalUsers)
        }

        if (user_group.includes(AdminGroup.EXTERNAL_QUOTA_EDITOR)) {
          const externalUsers = (
            await apiServerClient.request(ApiServerApiName.GET_EXTERNAL_USER_PRIORITY_QUOTA, {
              token: useAuthStore().token,
            })
          ).data
          quotas = quotas.concat(externalUsers)
        }
        this.userQuota = quotas
        this.isInitialized = true
        // 处理用户 Quota 组和用户 quota dict
        const allGroups = new Set<string>()
        const userGroupDict = {} as UserQuotaDict
        for (const item of this.userQuota) {
          allGroups.add(item.group)
          if (!userGroupDict[item.group]) userGroupDict[item.group] = {}
          if (!userGroupDict[item.group]![item.user_name])
            userGroupDict[item.group]![item.user_name] = {} as {
              [p: number]: { node?: number; limit?: number }
            }
          if (!userGroupDict[item.group]![item.user_name]![item.priority])
            userGroupDict[item.group]![item.user_name]![item.priority as TaskPriority] = {}
          if (item.resource === 'node')
            userGroupDict[item.group]![item.user_name]![item.priority]!.node = item.quota
          if (item.resource === 'node_limit')
            userGroupDict[item.group]![item.user_name]![item.priority]!.limit = item.quota
        }
        this.groupList = [...allGroups]
        this.userQuotaDict = userGroupDict
      } catch (err) {
        logger.error(err)
      } finally {
        this.isLoading = false
      }
    },
    async updateQuota(form: PriorityEditFormState) {
      await apiServerClient.request(ApiServerApiName.TRAINING_QUOTA_LIMIT_UPDATE, {
        internal_username: form.username,
        group: form.group,
        priority: priorityToNumber(form.priority),
        quota: form.quota ?? 0,
        token: useAuthStore().token,
      })
      await this.fetchData()
    },
  },
})
