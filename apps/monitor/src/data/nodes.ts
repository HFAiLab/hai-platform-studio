import { formatExternalUsername, uniq } from '@/utils'
import type { Node, NodeCurrentStatus, NodeScheduleZone, User } from '@hai-platform/shared'
import { computeNodeCurrentStatus, NodeType, UserRole } from '@hai-platform/shared'
import type { UsersNameMap } from '.'

export type NodesNameMap = Record<string, NodesDataItem>
export type { Node, NodeScheduleZone }
export { NodeCurrentStatus }

/**
 * 判断一个节点是否是 CPU 节点
 */
export const isCpuNode = (node: Node): boolean => node.type === NodeType.CPU

/**
 * 判断一个节点是否是 GPU 节点
 */
export const isGpuNode = (node: Node): boolean => node.type === NodeType.GPU

/**
 * 生成 key 为 node 名称，value 为 node 对象的 map
 */
export const getNodesNameMap = (nodes: NodesDataItem[]): NodesNameMap =>
  Object.fromEntries(nodes.map((item) => [item.name, item]))

/**
 * 节点数据元素
 *
 * 在节点信息基础上，添加了节点性能等数据
 */
export interface NodesDataItem extends Node {
  currentStatus: NodeCurrentStatus
  workingUserDisplay: string | null
}

/**
 * 生成节点数据元素
 */
export const getNodesDataItem = (node: Node, user?: User | null): NodesDataItem => {
  let workingUserDisplay: string | null = null
  if (user?.nick_name) {
    workingUserDisplay =
      node.working_user_role === UserRole.EXTERNAL
        ? formatExternalUsername(user.nick_name)
        : user.nick_name
  }
  return {
    ...node,
    currentStatus: computeNodeCurrentStatus(node),
    workingUserDisplay,
  }
}

export const getNodesDataItemByName = (
  nodeName: string,
  {
    nodesNameMap,
  }: {
    nodesNameMap: NodesNameMap
  },
): NodesDataItem | null => {
  const node = nodesNameMap[nodeName]
  if (!node) return null
  return getNodesDataItem(node)
}

export const getNodesData = (
  nodes: Node[],
  {
    usersNameMap,
  }: {
    usersNameMap: UsersNameMap
  },
): NodesDataItem[] =>
  nodes.map((item) =>
    getNodesDataItem(item, item.working_user ? usersNameMap[item.working_user] : null),
  )

/**
 * 根据 node 名称数组获取 node 对象数组
 */
export const getNodesDataByNames = (
  names: string[],
  { nodesNameMap }: { nodesNameMap: NodesNameMap },
): NodesDataItem[] => {
  const nodes: NodesDataItem[] = []
  for (const name of uniq(names)) {
    const node = nodesNameMap[name]
    if (node) nodes.push(node)
  }
  return nodes
}
