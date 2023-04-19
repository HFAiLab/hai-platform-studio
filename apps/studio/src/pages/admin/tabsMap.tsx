import { AdminGroup } from '@hai-platform/shared'
import type { TabItem } from '../../components/VerticalTab'
import { User } from '../../modules/user'

// Tabs
import { XTopicTab } from './tabs/XTopic'

// group 与可渲染组件对照
const dict = {
  [AdminGroup.XTOPIC_ADMIN]: XTopicTab,
} as const

export const getAdminTabs = (): TabItem[] => {
  const tabs = [] as TabItem[]
  const user = User.getInstance()
  const groupList = user.userInfo?.group_list ?? []

  for (const key of Object.keys(dict)) {
    if (groupList.includes(key) || groupList.includes(AdminGroup.ROOT)) {
      const tab = dict[key as keyof typeof dict]
      if (tab instanceof Array) {
        tab.forEach((t) => {
          tabs.push(t)
        })
      } else {
        tabs.push(tab)
      }
    }
  }
  return tabs
}
