import { TaskTrainingType } from '@/constants'
import { DEFAULT_USERS_TRAINING_TASKS_TABLE_COLUMN_KEYS } from '@/constants/default'
import type { NodeCurrentStatus, TasksQueueTrainingType } from '@/data'
import { defaultUserTrainingDetailColumns } from '@/data'
import { useStorage } from '@vueuse/core'
import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'

interface ConfigState {
  /**
   * 是否自动刷新数据
   */
  shouldAutoRefresh: boolean

  /**
   * 任务排队展示的训练类型
   */
  tasksQueueTrainingType: TasksQueueTrainingType

  /**
   * 节点分组展示的节点状态
   */
  nodesGroupsCurrentStatus: NodeCurrentStatus[]

  /**
   * 节点分组展示的最大节点数量
   */
  nodesGroupsMaxDisplayedNodesCount: number

  /**
   * 训练用户表格自定义列配置
   */
  userTrainingTasksTableColumnsKeys1: string[]

  /**
   * 用户任务详情表格自定义列配置
   */
  userTrainingDetailTableColumnKeys: string[]

  /**
   * 进入管理模式
   */
  showAdminMode: boolean

  /**
   * 是否显示所有用户
   */
  showAllUsers: boolean
}

/**
 * 配置项默认值
 */
const defaultConfigState: ConfigState = {
  shouldAutoRefresh: true,
  tasksQueueTrainingType: TaskTrainingType.GPU,
  nodesGroupsCurrentStatus: [],
  nodesGroupsMaxDisplayedNodesCount: 50,
  userTrainingTasksTableColumnsKeys1: DEFAULT_USERS_TRAINING_TASKS_TABLE_COLUMN_KEYS,
  userTrainingDetailTableColumnKeys: defaultUserTrainingDetailColumns,
  showAdminMode: false,
  showAllUsers: false,
}

/**
 * 本地保存用户的配置项状态
 */
const configStorage = useStorage<Partial<ConfigState>>('config-storage', {})
const resetConfigStorage = (): void => {
  configStorage.value = {}
}

const createConfigComputed = <T extends keyof ConfigState>(
  name: T,
): WritableComputedRef<ConfigState[T]> =>
  computed({
    get() {
      // 若没有配置值，则取默认值
      return configStorage.value[name] ?? defaultConfigState[name]
    },
    set(val) {
      if (val === defaultConfigState[name]) {
        // 若配置值和默认值相同，则删除配置值
        delete configStorage.value[name]
      } else {
        // 保存记录配置值
        configStorage.value[name] = val
      }
    },
  })

type ConfigComputed = {
  [K in keyof ConfigState]: WritableComputedRef<ConfigState[K]>
}

const configComputed = Object.fromEntries(
  Object.keys(defaultConfigState).map((item) => [
    item,
    createConfigComputed(item as keyof ConfigState),
  ]),
) as ConfigComputed

export const useConfig = (): ConfigComputed & {
  reset: () => void
} => ({
  ...configComputed,
  reset: resetConfigStorage,
})
