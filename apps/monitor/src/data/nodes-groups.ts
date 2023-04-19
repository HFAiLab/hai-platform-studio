import type { NodesDataItem } from './nodes'

/**
 * 节点分组数据元素，不包含分组的父子关系
 */
export interface NodesGroupsItem {
  name: string
  key: string
  nodes: NodesDataItem[]
}

export const getNodesGroups = (nodesData: NodesDataItem[]): NodesGroupsItem[] => {
  // 生成 key 为节点分组 key，value 为节点分组元素的 map
  const nodesGroupsKeyMap: Record<string, NodesGroupsItem> = {}

  for (const nodeData of nodesData) {
    // 若节点没有分组信息，设为 unlabeled 分组
    if (nodeData.mars_group === null) {
      nodeData.mars_group = 'unlabeled'
    }

    // 获取节点所属分组的 name 和 key
    const groups = nodeData.mars_group.split('.').map((item, index, arr) => ({
      name: item,
      key: arr.slice(0, index + 1).join('.'),
    }))

    // 遍历所有层级的分组
    for (const group of groups) {
      // 如果分组还不存在，则创建对应的空分组
      if (!nodesGroupsKeyMap[group.key]) {
        nodesGroupsKeyMap[group.key] = {
          ...group,
          nodes: [],
        }
      }
      // 将节点数据添加到对应分组
      nodesGroupsKeyMap[group.key]!.nodes.push(nodeData)
    }
  }

  const nodesGroups = Object.values(nodesGroupsKeyMap)

  // 将每个分组内的节点按照节点名称排序
  nodesGroups.forEach((item) => {
    item.nodes.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  })

  return nodesGroups
}

/**
 * 节点分组树元素
 *
 * 在节点分组元素的基础上，添加了子分组的情况
 */
export interface NodesGroupsTreeItem extends NodesGroupsItem {
  children: NodesGroupsTreeItem[]
}

/**
 * 根据节点分组数据生成节点分组树
 */
export const getNodesGroupsTree = (nodesData: NodesDataItem[]): NodesGroupsTreeItem[] => {
  const nodesGroups = getNodesGroups(nodesData)
  const nodesGroupsTreeFlatten: NodesGroupsTreeItem[] = []
  const nodesGroupsTree: NodesGroupsTreeItem[] = []

  // 按照分组 key 长度排序，确保父级分组在前
  const sortedNodesGroups = nodesGroups.sort((a, b) => {
    return a.key.length - b.key.length
  })
  // 遍历所有节点分组，生成分组树
  for (const nodeGroup of sortedNodesGroups) {
    const treeItem: NodesGroupsTreeItem = {
      ...nodeGroup,
      children: [],
    }
    // 查找父级分组
    const parentTreeItem = nodesGroupsTreeFlatten.find((item) =>
      nodeGroup.key.startsWith(`${item.key}.`),
    )
    if (parentTreeItem) {
      // 如果存在父级分组，则添加到父级分组的 children 中
      parentTreeItem.children.push(treeItem)
    } else {
      // 如果不存在父级分组，则添加到第一级 tree 中
      nodesGroupsTree.push(treeItem)
    }
    // 添加到平铺的 tree 元素数组中
    nodesGroupsTreeFlatten.push(treeItem)
  }

  // 遍历所有分组树元素，如果分组的 nodes 为空，则再添加一个仅包含 nodes 数据的空 child
  // 主要是为了便于 Tree 组件展示
  for (const treeItem of nodesGroupsTreeFlatten) {
    if (treeItem.children.length === 0) {
      treeItem.children.push({
        name: `${treeItem.name}__nodes`,
        key: `${treeItem.key}__nodes`,
        children: [],
        nodes: treeItem.nodes,
      })
    }
  }

  return nodesGroupsTree
}
