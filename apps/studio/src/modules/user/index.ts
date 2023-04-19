import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { IQuotaMap } from '@hai-platform/shared'
import { AdminGroup, convertUserQuotaInfoToQuotaMap } from '@hai-platform/shared'
import type { StudioUser } from '@hai-platform/studio-schemas/lib/esm/isomorph/user/info'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { AppToaster, CONSTS, getToken, getUserName } from '../../utils'

declare global {
  interface Window {
    _hf_user_if_in: boolean
  }
}

let globalUser: User | null = null
export class User {
  initDone = false;

  in = false

  quotaMap: IQuotaMap = {}

  _fetchQuotaAt: Date | null = null

  changeCallbacks: Set<() => void> = new Set()

  userInfo: StudioUser | null = null

  canAdmin = false

  static getInstance() {
    if (!globalUser) globalUser = new User()
    return globalUser
  }

  isHubAdmin = () => {
    if (!this.userInfo) return false
    return (
      this.userInfo.group_list.includes(AdminGroup.ROOT) ||
      this.userInfo.group_list.includes(AdminGroup.HUB_ADMIN)
    )
  }

  lazyInit() {
    return Promise.all([this.fetchUserInfo(), this.fetchQuotaInfo()]).then(() => {
      this.initDone = true
    })
  }

  getQuota(group: string, priority_label: string): { total: number; used: number; limit?: number } {
    return (
      (this.quotaMap[group] ?? ({} as any))[priority_label] ?? {
        total: 0,
        used: 0,
        limit: undefined,
      }
    )
  }

  getGroupNames() {
    return Object.keys(this.quotaMap)
  }

  async fetchUserInfo() {
    const userInfo = (
      await GlobalAilabServerClient.request(
        AilabServerApiName.TRAININGS_SAFE_GET_USER_INFO,
        undefined,
        {
          data: {
            token: getToken(),
            name: getUserName(),
          },
        },
      )
    ).data
    if (!userInfo) {
      AppToaster.show({
        intent: 'danger',
        message: '获取用户信息失败，请刷新页面',
      })
      throw new Error('getUserInfoFailed')
    }
    const internal = userInfo.group_list.includes(CONSTS.HFAPP_INTERNAL_USER_GROUP_TAG)
    this.canAdmin = userInfo.admin ?? false

    window._hf_user_if_in = internal
    this.in = internal
    this.userInfo = userInfo
    this.emitChangeCallback()
  }

  async fetchQuotaInfo(force?: boolean) {
    const resp2 = await GlobalAilabServerClient.request(
      AilabServerApiName.TRAININGS_USER_NODE_QUOTA_INFO,
      {
        force,
      },
    )

    this.quotaMap = convertUserQuotaInfoToQuotaMap(resp2)
    this._fetchQuotaAt = new Date()
    this.emitChangeCallback()
    return this.quotaMap
  }

  addChangeCallback(callback: () => void, thisObj?: any) {
    this.changeCallbacks.add(thisObj ? callback.bind(thisObj) : callback)
  }

  removeChangeCallback(callback: () => void) {
    this.changeCallbacks.delete(callback)
  }

  private emitChangeCallback() {
    ;[...this.changeCallbacks].map((func) => func())
  }

  isAccessTokenAdmin = () => {
    if (!this.userInfo) return false
    return this.userInfo.group_list.includes('create_access_token')
  }
}
