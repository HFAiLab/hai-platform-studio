import type { ServiceTaskAllTasksApiResult } from '@hai-platform/client-api-server'
import type { ClusterUnit, ContainerTaskByAdmin } from '@hai-platform/shared'
import {
  ContainerTaskStatus,
  getDefaultJupyterGroupPrefix,
  getDefaultJupyterGroupPrefixRegex,
} from '@hai-platform/shared'

export interface ServiceCountInfo {
  jupyter: number
  ssh: number
  custom: number
}

export interface ExtendContainerTaskByAdmin extends ContainerTaskByAdmin {
  countService: ServiceCountInfo
}

export interface CTMTaskMapMeta {
  countCPUUsed: number
  countMemoryUsed: number
}

export interface CTMTaskMap {
  meta: CTMTaskMapMeta
  tasks: Map<string, ExtendContainerTaskByAdmin>
}

export interface MetaFromClusterNode {
  countMemoryTotal: number
  countCPUTotal: number
}

export interface CTMUserMapMeta extends MetaFromClusterNode, CTMTaskMapMeta {
  users: Set<string>
  countPods: number
  countService: ServiceCountInfo
}

export interface CTMUserMap {
  meta: CTMUserMapMeta
  users: Map<string, CTMTaskMap>
}

export interface CTMNodeMapMeta extends CTMUserMapMeta {
  countNodes: number
  countMaxMemoryFree: number
}

export interface CTMNodeMap {
  meta: CTMNodeMapMeta
  nodes: Map<string, CTMUserMap>
}

export interface CTMGroupMap {
  // meta: any
  groups: Map<string, CTMNodeMap>
}

// 是否是 shared 分组
export const isSharedGroup = (group: string) => {
  return getDefaultJupyterGroupPrefixRegex().test(group)
}

// group 分组顺序相关
export const getGroupSortIndex = (group: string) => {
  if (group === `${getDefaultJupyterGroupPrefix()}_gpu`) return 3
  if (group === `${getDefaultJupyterGroupPrefix()}_cpu`) return 2
  if (isSharedGroup(group)) return 1
  return 0
}

// hint: Map 可直接遍历，且因为它是键值对集合，所以可直接使用 for…of 或 forEach 来高效遍历。这点不同的优点是为你的程序带来更高的执行效率。

const getDefaultCTMTaskMapMeta = (): CTMTaskMapMeta => {
  return {
    countCPUUsed: 0,
    countMemoryUsed: 0,
  }
}

const getDefaultCTMUserMapMeta = (): CTMUserMapMeta => {
  return {
    ...getDefaultCTMTaskMapMeta(),
    users: new Set(),
    countPods: 0,
    countCPUTotal: 0,
    countMemoryTotal: 0,
    countService: {
      jupyter: 0,
      ssh: 0,
      custom: 0,
    },
  }
}

export const getDefaultCTMNodeMapMeta = (): CTMNodeMapMeta => {
  return {
    ...getDefaultCTMUserMapMeta(),
    countNodes: 0,
    countMaxMemoryFree: 0,
  }
}

export const NOT_ASSIGN = 'not_assign'

export const computeTaskServiceCount = (data: ContainerTaskByAdmin) => {
  const res: ServiceCountInfo = {
    jupyter: 0,
    ssh: 0,
    custom: 0,
  }

  for (const service of Object.values(
    data.runtime_config_json.service_task?.services || data.config_json.schema.services,
  )) {
    if (service.name === 'ssh') {
      res.ssh += 1
    } else if (service.name === 'jupyter') {
      res.jupyter += 1
    } else {
      res.custom += 1
    }
  }
  return res
}

export const addCountService = (
  base: ServiceCountInfo,
  add: ServiceCountInfo,
): ServiceCountInfo => {
  return {
    jupyter: base.jupyter + add.jupyter,
    ssh: base.ssh + add.ssh,
    custom: base.custom + add.custom,
  }
}

interface ComputeOptions {
  skipNotRunning?: boolean
  searchValue: string
}

const hitSearch = (taskInfo: ContainerTaskByAdmin, searchValue?: string) => {
  if (!searchValue) return true
  return (
    taskInfo.user_name.includes(searchValue) ||
    taskInfo.nb_name.includes(searchValue) ||
    taskInfo.status.includes(searchValue) ||
    taskInfo.nb_name.includes(searchValue) ||
    taskInfo.group.includes(searchValue) ||
    (taskInfo.assigned_nodes[0] || '').includes(searchValue)
  )
}
export const computeList = (
  data: ServiceTaskAllTasksApiResult | undefined,
  clusterDFMap: Map<string, ClusterUnit> | undefined,
  options: ComputeOptions,
) => {
  const result: CTMGroupMap = {
    groups: new Map(),
  }

  for (const task of data?.tasks || []) {
    if (options.skipNotRunning && task.status === ContainerTaskStatus.STOPPED) continue

    const isGroupShared = isSharedGroup(task.group)

    const assigned_node = task.assigned_nodes[0] ?? NOT_ASSIGN

    const countService = computeTaskServiceCount(task)

    const clusterNodeInfo = clusterDFMap ? clusterDFMap.get(assigned_node) : undefined
    const currentNodeMemory = Math.floor((clusterNodeInfo?.memory || 0) / 1024 / 1024 / 1024)
    const currentNodeCPU = clusterNodeInfo?.cpu || 0

    let groupInfo = result.groups.get(task.group)
    if (!groupInfo) {
      groupInfo = {
        meta: getDefaultCTMNodeMapMeta(),
        nodes: new Map(),
      }
    }

    let nodeInfo = groupInfo.nodes.get(assigned_node)

    if (!nodeInfo) {
      nodeInfo = {
        meta: getDefaultCTMUserMapMeta(),
        users: new Map(),
      }
      if (clusterNodeInfo) {
        groupInfo.meta.countCPUTotal += currentNodeCPU
        groupInfo.meta.countMemoryTotal += currentNodeMemory
        nodeInfo.meta.countCPUTotal += currentNodeCPU
        nodeInfo.meta.countMemoryTotal += currentNodeMemory
      }
      groupInfo.meta.countNodes += 1
    }

    let tasksMapInfo = nodeInfo.users.get(task.user_name)
    if (!tasksMapInfo) {
      tasksMapInfo = {
        meta: getDefaultCTMTaskMapMeta(),
        tasks: new Map(),
      }

      nodeInfo.meta.users.add(task.user_name)
      groupInfo.meta.users.add(task.user_name)
    }

    if (hitSearch(task, options.searchValue)) {
      tasksMapInfo.tasks.set(task.nb_name, {
        ...task,
        countService,
      })
    }

    nodeInfo.meta.countPods += 1
    groupInfo.meta.countPods += 1
    nodeInfo.meta.countService = addCountService(nodeInfo.meta.countService, countService)
    groupInfo.meta.countService = addCountService(groupInfo.meta.countService, countService)

    if (task.status === ContainerTaskStatus.RUNNING) {
      if (isGroupShared) {
        const cpuUsed = task.config_json.schema.resource.cpu || 0
        const memoryUsed = task.config_json.schema.resource.memory || 0
        tasksMapInfo.meta.countCPUUsed += cpuUsed
        nodeInfo.meta.countCPUUsed += cpuUsed
        groupInfo.meta.countCPUUsed += cpuUsed
        nodeInfo.meta.countMemoryUsed += memoryUsed
        groupInfo.meta.countMemoryUsed += memoryUsed
        tasksMapInfo.meta.countMemoryUsed += memoryUsed
      } else {
        tasksMapInfo.meta.countCPUUsed += currentNodeCPU
        nodeInfo.meta.countCPUUsed += currentNodeCPU
        groupInfo.meta.countCPUUsed += currentNodeCPU
        nodeInfo.meta.countMemoryUsed += currentNodeMemory
        groupInfo.meta.countMemoryUsed += currentNodeMemory
        tasksMapInfo.meta.countMemoryUsed += currentNodeMemory
        task.config_json.schema.resource.cpu = currentNodeCPU
        task.config_json.schema.resource.memory = currentNodeMemory
      }
    }

    nodeInfo.users.set(task.user_name, tasksMapInfo)
    groupInfo.nodes.set(assigned_node, nodeInfo)
    result.groups.set(task.group, groupInfo)
  }

  for (const [group, groupValue] of result.groups) {
    let maxMemoryFree = 0
    for (const [node, nodeValue] of groupValue.nodes) {
      maxMemoryFree = Math.max(
        maxMemoryFree,
        nodeValue.meta.countMemoryTotal - nodeValue.meta.countMemoryUsed,
      )

      const userNodeCount = [...nodeValue.users.values()].reduce((a, curr) => {
        return a + curr.tasks.size
      }, 0)

      if (userNodeCount === 0) {
        groupValue.nodes.delete(node)
      }
    }

    if (groupValue.nodes.size === 0) {
      result.groups.delete(group)
    }

    if (isSharedGroup(group)) groupValue.meta.countMaxMemoryFree = maxMemoryFree
  }

  // console.log('compute cost:', Date.now() - begin)
  return result
}
