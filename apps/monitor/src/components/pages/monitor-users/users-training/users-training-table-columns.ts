import type { TasksQueueTrainingType } from '@/data'
import { usersTrainingPrioritiesKeys, usersTrainingStatisticsKeys } from '@/data'
import { TaskPriorityName, UserRole } from '@hai-platform/shared'
import type { TableColumnsType } from 'ant-design-vue'
import type { ColumnGroupType, ColumnType } from 'ant-design-vue/lib/table'

interface UsersTrainingTableColumnsOption {
  drawerVisible: boolean
  quotaGroup: string
  taskType: TasksQueueTrainingType
  isGPU: boolean
}

const getColumnsTasksWorking = (opt: UsersTrainingTableColumnsOption): TableColumnsType<any> =>
  usersTrainingStatisticsKeys.map((key) => ({
    title: key === 'all' ? '总计' : key,
    dataIndex: `working_task_num__${key}`,
    key: `working_task_num__${key}`,
    align: 'center',
    width: opt.drawerVisible ? 40 : 50,
    sorter: (a, b) => a[`working_task_num__${key}`] - b[`working_task_num__${key}`],
    // 隐藏 sorter
    customHeaderCell: () => ({ class: 'hide-sorter' }),
    customCell: () => ({ class: 'compact-padding' }),
  }))

const getColumnsNodesGpu = (opt: UsersTrainingTableColumnsOption): TableColumnsType<any> =>
  usersTrainingStatisticsKeys.map((key) => ({
    title: key === 'all' ? '总计' : key,
    dataIndex: `gpu_node_num__${key}`,
    key: `gpu_node_num__${key}`,
    align: 'center',
    // eslint-disable-next-line no-nested-ternary
    width: opt.drawerVisible ? (key === 'all' ? 50 : 40) : 60,
    // 默认在非 CPU section 下 根据 GPU 节点总数排序
    defaultSortOrder: opt.isGPU && key === 'all' ? 'descend' : undefined,
    sorter: (a, b) => a[`gpu_node_num__${key}`] - b[`gpu_node_num__${key}`],
    // 隐藏 sorter
    customHeaderCell: () => ({
      class: `${key === 'all' && opt.isGPU ? 'right-bold-border' : ''} hide-sorter`,
    }),
    customCell: () => ({
      class: `${key === 'all' && opt.isGPU ? 'right-bold-border' : ''} compact-padding`,
    }),
  }))

const getColumnsNodesCpu = (opt: UsersTrainingTableColumnsOption): TableColumnsType<any> =>
  usersTrainingStatisticsKeys.map((key) => ({
    title: key === 'all' ? '总计' : key,
    dataIndex: `cpu_node_num__${key}`,
    key: `cpu_node_num__${key}`,
    align: 'center',
    // eslint-disable-next-line no-nested-ternary
    width: opt.drawerVisible ? (key === 'all' ? 50 : 40) : 60,
    // 默认根据 GPU 节点总数排序
    defaultSortOrder: !opt.isGPU && key === 'all' ? 'descend' : undefined,
    sorter: (a, b) => a[`cpu_node_num__${key}`] - b[`cpu_node_num__${key}`],
    // 隐藏 sorter
    customHeaderCell: () => ({
      class: `${key === 'all' && !opt.isGPU ? 'right-bold-border' : ''} hide-sorter`,
    }),
    customCell: () => ({
      class: `${key === 'all' && !opt.isGPU ? 'right-bold-border' : ''} compact-padding`,
    }),
  }))

const getNodeColumns = (opt: UsersTrainingTableColumnsOption): TableColumnsType<any> => {
  const gpu = {
    title: 'GPU',
    key: 'gpu_node_num',
    dataIndex: 'gpu_node_num',
    align: 'center',
    // TODO: https://github.com/vueComponent/ant-design-vue/issues/5889
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.gpu_node_num - b.gpu_node_num,
    customHeaderCell: () => ({ class: `${opt.isGPU ? 'right-bold-border' : ''} hide-sorter` }),
    children: getColumnsNodesGpu(opt),
  } as ColumnGroupType<any>
  const cpu = {
    title: 'CPU',
    key: 'cpu_node_num',
    dataIndex: 'cpu_node_num',
    align: 'center',
    width: opt.drawerVisible ? 40 : 60,
    sorter: (a, b) => a.cpu_node_num - b.cpu_node_num,
    customCell: () => ({ class: `${!opt.isGPU ? 'right-bold-border' : ''} compact-padding` }),
    customHeaderCell: () => ({ class: !opt.isGPU ? 'right-bold-border' : '' }),
    children: getColumnsNodesCpu(opt),
  } as ColumnType<any>
  if (!opt.isGPU) return [cpu]
  return [gpu]
}

export const getColumns = (opt: UsersTrainingTableColumnsOption): TableColumnsType<any> => {
  const cols: TableColumnsType<any> = [
    {
      title: '用户名',
      key: 'nickname',
      dataIndex: 'nickname',
      align: 'center',
      ellipsis: true,
      width: opt.drawerVisible ? 80 : 150,
      minWidth: 80,
      maxWidth: 300,
      sortDirections: ['ascend', 'descend'],
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      customRender: ({ value, record }) =>
        `${record.role === UserRole.EXTERNAL ? '*' : ''}${value}`,
      customCell: () => ({ class: 'right-bold-border' }),
      customHeaderCell: () => ({ class: 'right-bold-border' }),
    },
    {
      title: '任务数',
      key: 'task_num',
      sorter: (a, b) => a.task_num - b.task_num,
      children: [
        {
          title: '运行中',
          key: 'running_task_num',
          dataIndex: 'running_task_num',
          align: 'center',
          sorter: (a, b) => a.running_task_num - b.running_task_num,
          children: getColumnsTasksWorking(opt),
          customHeaderCell: () => ({ class: 'hide-sorter' }),
        },
        {
          title: '排队中',
          key: 'queueing_task_num',
          dataIndex: 'queueing_task_num',
          align: 'center',
          width: opt.drawerVisible ? 40 : 50,
          sorter: (a, b) => a.queueing_task_num - b.queueing_task_num,
          customCell: () => ({ class: 'right-bold-border compact-padding' }),
          customHeaderCell: () => ({ class: 'right-bold-border hide-sorter' }),
        },
      ],
      customHeaderCell: () => ({ class: 'right-bold-border' }),
    },
    {
      title: '节点数',
      key: 'node_num',
      sorter: (a, b) => a.node_num - b.node_num,
      children: getNodeColumns(opt),
      customHeaderCell: () => ({ class: 'right-bold-border' }),
    },
    {
      title: 'Quota(当前 / 上限)',
      key: 'quota',
      children: [
        {
          title: opt.quotaGroup,
          key: 'quota_group',
          align: 'center',
          children: usersTrainingPrioritiesKeys.map((key) => ({
            title: key,
            dataIndex: `quota__${key}`,
            key: `quota__${key}`,
            align: 'center',
            width: opt.drawerVisible ? 40 : 60,
            // 隐藏 sorter
            customHeaderCell: () => ({
              class: `${key === TaskPriorityName.LOW ? 'right-bold-border' : ''} hide-sorter`,
            }),
            customCell: () => ({
              class: `${key === TaskPriorityName.LOW ? 'right-bold-border' : ''} compact-padding`,
            }),
          })),
          customHeaderCell: () => ({ class: 'right-bold-border' }),
        },
      ],
    },
  ]
  if (!opt.drawerVisible)
    cols.push({
      title: '任务详情',
      key: 'details',
      align: 'center',
      width: 80,
    })
  return cols
}
