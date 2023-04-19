import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import { ONEMINUTE } from '@hai-platform/studio-toolkit/lib/esm/date/utils'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { getToken } from '../../utils'

export const XTOPIC_CHECK_NOTIFICATION_INTERVAL = ONEMINUTE

export const UnreadNotificationStorageKey = 'ailab-web-xtopic-unread-notification'

export class RefreshXTopicNotification {
  fetching: boolean

  lastUnread: number

  getUnread = () => {
    const unreadStr = localStorage.getItem(UnreadNotificationStorageKey)
    if (!unreadStr) return 0
    this.lastUnread = Number(unreadStr)
    return this.lastUnread
  }

  checkUnreadNotification = async () => {
    if (!getToken()) return
    if (this.fetching) return
    this.fetching = true
    const { unread } = await GlobalAilabServerClient.request(
      AilabServerApiName.XTOPIC_NOTIFICATION_UNREAD,
    )
    this.fetching = false
    localStorage.setItem(UnreadNotificationStorageKey, unread.toString())
    // 此行的作用：希望当前的页面能够收到 storage 事件，用来做通知展示的同步
    if (unread !== this.lastUnread) window.dispatchEvent(new Event('storage'))
    this.lastUnread = unread
  }

  removeUnread = () => {
    this.lastUnread = 0
    localStorage.removeItem(UnreadNotificationStorageKey)
  }
}

export const GlobalRefreshXtopicNotification = new RefreshXTopicNotification()
