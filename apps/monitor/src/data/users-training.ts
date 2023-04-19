import type { TableColumnsType } from 'ant-design-vue'
import type { ColumnGroupType, ColumnType } from 'ant-design-vue/lib/table'
import type { NodeScheduleZone, NodesNameMap } from './nodes'
import { isCpuNode } from './nodes'
import type { RunningTask, TasksDataItem } from './tasks'
import {
  getNonJupyterTasks,
  getTasksData,
  isQueuedTask,
  TaskPriority,
  TaskPriorityName,
  TASK_PRIORITY_NAMES_ALL,
} from './tasks'
import type { UsersDataItem, UsersNameMap } from './users'
import { getUsersDataFromTasks } from './users'

/**
 * 训练用户信息
 */
export interface UsersTraining {
  /** 任务 */
  tasks: TasksDataItem[]
  /** 用户数据 */
  usersData: UsersTrainingUsersDataItem[]
  /** 统计数据 */
  statistics: UsersTrainingStatistics
}

/**
 * 训练用户数据元素
 */
export interface UsersTrainingUsersDataItem extends UsersDataItem {
  /** 统计数据 */
  statistics: UsersTrainingStatistics
}

export type UsersTrainingRowDataItem = UsersTrainingUsersDataItem & {
  quota: { [K in keyof TaskPriorityName]: { node?: number; limit?: number } }
}

/**
 * 训练用户统计数据
 */
export interface UsersTrainingStatistics {
  /** 占用节点统计 */
  nodes: UsersTrainingStatisticsNodes
  /** 任务统计 */
  tasks: UsersTrainingStatisticsTasks
}

/**
 * 用户各优先级/各区域任务占用节点统计数据
 */
export type UsersTrainingStatisticsNodes = Record<
  TaskPriorityName | 'all' | NodeScheduleZone,
  UsersTrainingStatisticsNodesItem
>
export interface UsersTrainingStatisticsNodesItem {
  /** 占用节点总数 */
  total: number
  /** 占用 GPU 节点数 */
  gpu: number
  /** 占用 CPU 节点数 */
  cpu: number
}

/**
 * 用户各优先级任务统计数据
 */
export type UsersTrainingStatisticsTasks = Record<
  TaskPriorityName | 'all' | NodeScheduleZone,
  UsersTrainingStatisticsTasksItem
>
export interface UsersTrainingStatisticsTasksItem {
  /** 任务总数 */
  total: number
  /** 运行中任务数 */
  working: number
  /** 排队中任务数 */
  queued: number
}

export type UsersTrainingStatisticsTaskType = 'total' | 'gpu' | 'cpu'

export const getUsersTrainingStatistics = (tasks: TasksDataItem[]): UsersTrainingStatistics => {
  const keys = ['all', 'A', 'B', ...TASK_PRIORITY_NAMES_ALL].reverse()
  const statistics = {
    nodes: Object.fromEntries(
      keys.map((item) => [
        item,
        {
          total: 0,
          cpu: 0,
          gpu: 0,
        },
      ]),
    ),
    tasks: Object.fromEntries(
      keys.map((item) => [
        item,
        {
          total: 0,
          working: 0,
          queued: 0,
        },
      ]),
    ),
  } as UsersTrainingStatistics
  for (const task of tasks) {
    // 任务数据
    const tasksNum = 1
    statistics.tasks.all.total += tasksNum
    statistics.tasks[task.priorityName].total += tasksNum
    if (isQueuedTask(task)) {
      statistics.tasks.all.queued += tasksNum
      statistics.tasks[task.priorityName].queued += tasksNum
    } else {
      statistics.tasks.all.working += tasksNum
      statistics.tasks[task.priorityName].working += tasksNum
      if (task.priority === TaskPriority.AUTO && task.autoPriorityName) {
        statistics.tasks[task.autoPriorityName].working += tasksNum
      }
      if (task.scheduleZone) {
        statistics.tasks[task.scheduleZone].working += tasksNum
      }
    }

    // 节点数据
    const nodesNum = task.nodesList.length
    if (nodesNum) {
      statistics.nodes.all.total += nodesNum
      statistics.nodes[task.priorityName].total += nodesNum
      const nodesNumCpu = task.nodesList.filter((item) => isCpuNode(item)).length
      const nodesNumGpu = nodesNum - nodesNumCpu
      statistics.nodes.all.cpu += nodesNumCpu
      statistics.nodes[task.priorityName].cpu += nodesNumCpu
      statistics.nodes.all.gpu += nodesNumGpu
      statistics.nodes[task.priorityName].gpu += nodesNumGpu
      if (task.priority === TaskPriority.AUTO && task.autoPriorityName) {
        // 目前默认只有 GPU 任务有 auto
        statistics.nodes[task.autoPriorityName].gpu += nodesNumGpu
        statistics.nodes[task.autoPriorityName].gpu += nodesNumCpu
      }
      if (task.scheduleZone) {
        statistics.nodes[task.scheduleZone].gpu += nodesNumGpu
        statistics.nodes[task.scheduleZone].cpu += nodesNumCpu
        statistics.nodes[task.scheduleZone].total += nodesNum
      }
    }
  }
  return statistics
}

export const getUsersTrainingUsersData = (
  usersData: UsersDataItem[],
): UsersTrainingUsersDataItem[] =>
  usersData
    .map((userData) => {
      return {
        ...userData,
        statistics: getUsersTrainingStatistics(userData.tasks),
      }
    })
    .sort((a, b) => {
      if (a.statistics.nodes.all.gpu !== b.statistics.nodes.all.gpu) {
        return a.statistics.nodes.all.gpu - b.statistics.nodes.all.gpu
      }
      return a.statistics.nodes.all.cpu - b.statistics.nodes.all.cpu
    })

export const getUsersTraining = (
  tasks: RunningTask[],
  {
    nodesNameMap,
    usersNameMap,
  }: {
    nodesNameMap: NodesNameMap
    usersNameMap: UsersNameMap
  },
  showAllUsers: boolean,
): UsersTraining => {
  // 注意，虽然命名上是训练用户数据，但是这里仅过滤掉了 jupyter 任务，还包含了除训练任务外的其他任务
  const trainingTasks = getTasksData(getNonJupyterTasks(tasks), {
    nodesNameMap,
  })
  const usersData = getUsersDataFromTasks(
    trainingTasks,
    {
      nodesNameMap,
      usersNameMap,
    },
    showAllUsers,
  )
  return {
    tasks: trainingTasks,
    usersData: getUsersTrainingUsersData(usersData),
    statistics: getUsersTrainingStatistics(trainingTasks),
  }
}

export const usersTrainingPrioritiesKeys = [
  TaskPriorityName.EXTREME_HIGH,
  TaskPriorityName.VERY_HIGH,
  TaskPriorityName.HIGH,
  TaskPriorityName.ABOVE_NORMAL,
  TaskPriorityName.NORMAL,
  TaskPriorityName.BELOW_NORMAL,
  TaskPriorityName.LOW,
]

export const usersTrainingStatisticsKeys = [
  ...usersTrainingPrioritiesKeys,
  'A',
  'B',
  'all',
] as const

type UsersTrainingColumnsTreeNode = {
  title: string
  key: string
  dataIndex?: string[]
  children?: UsersTrainingColumnsTreeNode[]
}

export const usersTrainingColumnsTree: UsersTrainingColumnsTreeNode[] = [
  {
    title: '用户名',
    key: 'nickname',
    dataIndex: ['nick_name'],
  },
  {
    title: '任务数',
    key: 'task_num',
    dataIndex: ['statistics', 'tasks', 'all', 'total'],
    children: [
      {
        title: '运行中',
        key: 'running_task_num',
        dataIndex: ['statistics', 'tasks', 'all', 'working'],
        children: usersTrainingStatisticsKeys.map((key) => ({
          title: key === 'all' ? '总计' : key,
          key: `working_task_num__${key}`,
          dataIndex: ['statistics', 'tasks', key, 'working'],
        })),
      },
      {
        title: '排队中',
        key: 'queueing_task_num',
        dataIndex: ['statistics', 'tasks', 'all', 'queued'],
      },
    ],
  },
  {
    title: '节点数',
    key: 'node_num',
    dataIndex: ['statistics', 'nodes', 'all', 'total'],
    children: [
      {
        title: 'GPU',
        key: 'gpu_node_num',
        dataIndex: ['statistics', 'nodes', 'all', 'gpu'],
        children: usersTrainingStatisticsKeys.map((key) => ({
          title: key === 'all' ? '总计' : key,
          key: `gpu_node_num__${key}`,
          dataIndex: ['statistics', 'nodes', key, 'gpu'],
        })),
      },
      {
        title: 'CPU',
        key: 'cpu_node_num',
        dataIndex: ['statistics', 'nodes', 'all', 'cpu'],
        children: usersTrainingStatisticsKeys.map((key) => ({
          title: key === 'all' ? '总计' : key,
          key: `cpu_node_num__${key}`,
          dataIndex: ['statistics', 'nodes', key, 'cpu'],
        })),
      },
    ],
  },
  {
    title: 'Quota',
    key: 'quota',
    children: [
      {
        title: 'Quota 组选择器',
        key: 'quota_group',
        children: usersTrainingPrioritiesKeys.map((key) => ({
          title: key,
          key: `quota__${key}`,
        })),
      },
    ],
  },
]

const dfsConfigColumns = (
  configColumns: string[],
  ret: UsersTrainingColumnsTreeNode[],
  nodes: UsersTrainingColumnsTreeNode[],
  parent: UsersTrainingColumnsTreeNode | null,
): boolean => {
  let hasChild = false
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      hasChild = dfsConfigColumns(configColumns, ret, node.children, node) || hasChild
    }
    if (configColumns.includes(node.key)) {
      hasChild = true
      ret.push({ title: node.title, key: node.key, dataIndex: node.dataIndex })
    }
  }
  if (hasChild && parent) ret.push(parent)
  return hasChild
}

export const getConfigColumnsWithParents = (
  configColumns: string[],
): UsersTrainingColumnsTreeNode[] => {
  const ret = [] as UsersTrainingColumnsTreeNode[]
  if (configColumns?.length) dfsConfigColumns(configColumns, ret, usersTrainingColumnsTree, null)
  return ret
}

export const usersTrainingDetailColumns: ColumnType<TasksDataItem>[] = [
  {
    title: '任务 ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
  },
  {
    title: '任务名',
    dataIndex: 'nb_name',
    key: 'nb_name',
  },
  {
    title: '区域',
    dataIndex: 'scheduleZone',
    key: 'scheduleZone',
    align: 'center',
    width: 35,
  },
  {
    title: '提交组',
    dataIndex: 'client_group',
    key: 'client_group',
    width: 78,
  },
  {
    title: '节点',
    dataIndex: 'nodes',
    key: 'nodes',
    align: 'center',
    width: 35,
  },
  {
    title: '时长',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
    width: 60,
  },
]

export const defaultUserTrainingDetailColumns = usersTrainingDetailColumns.map(
  (col) => col.key?.toString() ?? '',
)

export const filterKeys = (
  columns: TableColumnsType<UsersTrainingRowDataItem>,
  cols: UsersTrainingColumnsTreeNode[],
): TableColumnsType<UsersTrainingRowDataItem> => {
  const ret = [] as TableColumnsType<UsersTrainingRowDataItem>
  for (const col of columns) {
    const shallowCopiedColumn = { ...col } as ColumnGroupType<UsersTrainingRowDataItem>
    if (cols.some((c) => c.key === col.key?.toString() ?? '')) ret.push(shallowCopiedColumn)
    if ((col as ColumnGroupType<UsersTrainingRowDataItem>).children) {
      shallowCopiedColumn.children = filterKeys(
        (col as ColumnGroupType<UsersTrainingRowDataItem>).children,
        cols,
      )
      if (
        shallowCopiedColumn.children.length === 0 &&
        ret[ret.length - 1]?.key === col.key?.toString()
      ) {
        ret.splice(-1)
      }
    }
  }
  return ret
}
