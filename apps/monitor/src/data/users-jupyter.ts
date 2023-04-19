import type { Node, RunningTask } from '@hai-platform/shared'
import type { NodesDataItem, NodesNameMap } from './nodes'
import { getNodesDataByNames, isCpuNode } from './nodes'
import type { TasksDataItem } from './tasks'
import { getJupyterTasks, getTasksData } from './tasks'
import { getUsersDataFromTasks } from './users'
import type { UsersDataItem, UsersNameMap } from './users'

/**
 * Jupyter 用户信息
 */
export interface UsersJupyter {
  /**
   * 节点
   */
  nodes: Node[]

  /**
   * 任务
   */
  tasks: TasksDataItem[]

  /**
   * 用户数据
   */
  usersData: UsersJupyterUsersDataItem[]
}

export interface UsersJupyterUsersDataItem extends UsersDataItem {
  statistics: UsersJupyterStatistics
}

export interface UsersJupyterStatistics {
  cpu: number
  memory: number
  gpu: {
    exclusive: number
    shared: number
  }
  tasks: number
  exclusive: {
    cpu: number
    gpu: number
  }
}

export const getUsersJupyterStatistics = (tasks: TasksDataItem[]): UsersJupyterStatistics => {
  const statistics = {
    cpu: 0,
    memory: 0,
    gpu: { exclusive: 0, shared: 0 },
    exclusive: { cpu: 0, gpu: 0 },
    tasks: 0,
  } as UsersJupyterStatistics
  const sharedNodes = new Map<string, NodesDataItem>()
  for (const task of tasks) {
    statistics.cpu += task.config_json.cpu as number
    statistics.memory += task.config_json.memory as number
    statistics.tasks += 1
    for (const node of task.nodesList) {
      if (node.currentStatus === 'exclusive') {
        statistics.gpu.exclusive += node.gpu_num
        if (isCpuNode(node)) {
          statistics.exclusive.cpu += 1
        } else {
          statistics.exclusive.gpu += 1
        }
      } else {
        sharedNodes.set(node.name, node)
      }
    }
  }
  statistics.gpu.shared += [...sharedNodes.values()].reduce((pre, cur) => pre + cur.gpu_num, 0)
  return statistics
}

export const getUsersJupyterTableData = (
  usersData: UsersDataItem[],
): UsersJupyterUsersDataItem[] => {
  return usersData.map((userData) => {
    return {
      ...userData,
      statistics: getUsersJupyterStatistics(userData.tasks),
    }
  })
}

export const getUsersJupyter = (
  tasks: RunningTask[],
  {
    nodesNameMap,
    usersNameMap,
  }: {
    nodesNameMap: NodesNameMap
    usersNameMap: UsersNameMap
  },
): UsersJupyter => {
  const jupyterTasks = getTasksData(getJupyterTasks(tasks), {
    nodesNameMap,
  })
  const usersData = getUsersDataFromTasks(jupyterTasks, {
    nodesNameMap,
    usersNameMap,
  })
  const jupyterUsersData = getUsersJupyterTableData(usersData)
  jupyterUsersData.sort((u1, u2) => {
    if (u1.statistics.exclusive.gpu !== u2.statistics.exclusive.gpu) {
      return u2.statistics.exclusive.gpu - u1.statistics.exclusive.gpu
    }
    if (u1.statistics.exclusive.cpu !== u2.statistics.exclusive.cpu) {
      return u2.statistics.exclusive.cpu - u1.statistics.exclusive.cpu
    }
    return u2.statistics.memory - u1.statistics.memory
  })
  return {
    nodes: getNodesDataByNames(
      jupyterTasks.flatMap((item) => item.assigned_nodes),
      { nodesNameMap },
    ),
    tasks: jupyterTasks,
    usersData: jupyterUsersData,
  }
}
