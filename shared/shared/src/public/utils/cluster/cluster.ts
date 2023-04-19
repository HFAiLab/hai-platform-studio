/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */

import type { ClusterUnit, IClusterInfoUsage } from '../../../common/types'

export const GroupNames = {
  not_assigned: 'not_assigned',
}

// 不是叶子节点，但是可以当成叶子节点的节点：

export interface ClusterMTreeRoot {
  children: {
    [key: string]: ClusterMTreeUnit
  }
}

export interface ClusterMTreeUnit {
  level: number
  free: number
  total: number
  children: {
    [key: string]: ClusterMTreeUnit
  }
}

/**
 * 生成树状的 cluster 列表
 */
export const makeListFromClusterDF = (
  df: Array<ClusterUnit>,
  options?: unknown,
): Array<IClusterInfoUsage> => {
  const treeRoot: ClusterMTreeRoot = {
    children: {},
  }

  // 把节点放入中间态的树
  const insertToTree = (groups: string[], node: ClusterUnit) => {
    let currentRoot = treeRoot

    const mGroups = [...groups] // 会做一些改变

    let level = 0
    const isFree = !node.working

    while (mGroups.length) {
      const group = mGroups.shift()!
      if (!(group in currentRoot.children)) {
        currentRoot.children[group] = {
          level,
          total: 0,
          free: 0,
          children: {},
        }
      }

      currentRoot.children[group]!.total += 1
      currentRoot.children[group]!.free += isFree ? 1 : 0
      level += 1
      currentRoot = currentRoot.children[group]!
    }
  }

  // ---------------------生成树-----------------------
  for (const node of df) {
    if (
      node.status.indexOf('NotReady') !== -1 ||
      node.status.indexOf('SchedulingDisabled') !== -1
    ) {
      continue
    }

    if (!node.mars_group) {
      // master 节点无此属性
      continue
    }

    let groups = node.mars_group.split('.')
    if (!groups.length) {
      groups = [GroupNames.not_assigned]
    }

    /**
     * hint:
     * 之前的逻辑这里主要用的是 node.is_working
     * is_working 是老的逻辑，取的是 pod 表里非终态的所有 pod
     * working 取的是 task 表，更准确
     */

    insertToTree(groups, node)
  }

  // ---------------------生成 list-----------------------
  const step_cross = ' ├─'
  const step_corner = ' └─'
  const step_space = '   '
  const sortUnits = (a: [string, ClusterMTreeUnit], b: [string, ClusterMTreeUnit]) => {
    return a >= b ? 1 : -1
  }

  const list: IClusterInfoUsage[] = []

  // 生成最终可视化的 list
  const pushToList = (space: string, cross: string, name: string, unit: ClusterMTreeUnit) => {
    list.push({
      show: `${space}${cross}${name}`,
      group: name,
      total: unit.total,
      free: unit.free,
      isLeaf: Object.keys(unit.children).length === 0,
    })

    const children = Object.entries(unit.children)

    for (let i = 0; i < children.length; i += 1) {
      const [nextKey, nextUnit] = children[i]!
      pushToList(
        space + step_space,
        i === children.length - 1 ? step_corner : step_cross,
        nextKey,
        nextUnit,
      )
    }
  }

  for (const [key, unit] of Object.entries(treeRoot.children).sort(sortUnits)) {
    pushToList('', '', key, unit)
  }

  return list
}
