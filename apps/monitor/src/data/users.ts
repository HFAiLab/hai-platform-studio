import type { Node, User } from '@hai-platform/shared'
import { TaskTaskType, UserRole } from '@hai-platform/shared'
import { formatExternalUsername } from '@/utils'
import { getNodesDataByNames } from './nodes'
import type { NodesNameMap } from './nodes'
import { isQueuedTask } from './tasks'
import type { TasksDataItem } from './tasks'

export type UsersNameMap = Record<string, User>

/**
 * 生成 key 为用户名，value 为 user 对象的 map
 */
export const getUsersNameMap = (users: User[]): UsersNameMap =>
  Object.fromEntries(users.map((item) => [item.user_name, item]))

/**
 * 用户数据元素
 *
 * 在用户信息基础上，添加了用户任务、节点、IO 等数据
 */
export interface UsersDataItem extends User {
  /**
   * 展示的用户名
   */
  usernameDisplay: string

  /**
   * 节点
   */
  nodes: Node[]

  /**
   * 任务
   */
  tasks: TasksDataItem[]
}

/**
 * 根据任务数据生成对应的用户数据
 */
export const getUsersDataFromTasks = (
  tasks: TasksDataItem[],
  {
    nodesNameMap,
    usersNameMap,
  }: {
    nodesNameMap: NodesNameMap
    usersNameMap: UsersNameMap
  },
  showAllUsers = false,
): UsersDataItem[] => {
  // 生成空用户数据
  const usersDataNameMap: Record<string, UsersDataItem> = {}

  if (showAllUsers) {
    for (const username in usersNameMap) {
      const user = usersNameMap[username]
      if (!user) continue
      usersDataNameMap[username] = {
        ...user,
        usernameDisplay:
          user.role === UserRole.EXTERNAL ? formatExternalUsername(user.user_name) : user.user_name,
        nodes: [],
        tasks: [],
      }
    }
  }

  // 填充用户任务
  for (const task of tasks) {
    // OPENSOURCE_DELETE_BEGIN
    // 排除部分任务
    if (task.task_type === TaskTaskType.VALIDATION_TASK) continue
    // OPENSOURCE_DELETE_END
    // 创建对应用户数据
    if (!usersDataNameMap[task.user_name]) {
      const user = usersNameMap[task.user_name]
      if (!user) continue
      usersDataNameMap[task.user_name] = {
        ...user,
        usernameDisplay:
          user.role === UserRole.EXTERNAL ? formatExternalUsername(user.user_name) : user.user_name,
        nodes: [],
        tasks: [],
      }
    }
    const userData = usersDataNameMap[task.user_name]
    if (userData) {
      userData.tasks.push(task)
    }
  }

  // 填充用户节点
  const usersData = Object.values(usersDataNameMap)
  for (const userData of usersData) {
    // 由于不同任务的节点有可能重复，所以添加完用户的全部任务后再填充用户的全部节点
    userData.nodes = getNodesDataByNames(
      userData.tasks.flatMap((item) => (isQueuedTask(item) ? [] : item.assigned_nodes)),
      { nodesNameMap },
    )
  }

  return usersData
}
