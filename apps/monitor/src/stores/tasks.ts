import type { RunningTask, TaskScheduleZoneConfig } from '@hai-platform/shared'
import { Modal, message } from 'ant-design-vue'
import { defineStore } from 'pinia'
import type { TasksDataItem } from '@/data'
import { getTasksData } from '@/data'
import { ApiServerApiName, apiServerClient } from '@/services'
import { logger } from '@/utils'
import { useAuthStore } from './auth'
import { useNodesOverviewStore } from './nodes-overview'

interface TasksState {
  /**
   * 任务数据
   */
  tasks: RunningTask[]

  /**
   * 是否已初始化
   */
  isInitialized: boolean

  /**
   * 是否正在获取数据
   */
  isLoading: boolean

  tasksData: TasksDataItem[]
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
    isInitialized: false,
    isLoading: false,
    tasksData: [],
  }),

  actions: {
    /**
     * 调用接口并更新数据
     */
    async fetchData() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const tasks = await apiServerClient.request(ApiServerApiName.GET_RUNNING_TASKS, {
          token: useAuthStore().token,
        })
        this.tasks = tasks
        this.isInitialized = true
        this.tasksData = getTasksData(tasks, {
          nodesNameMap: useNodesOverviewStore().nodesNameMap,
        })
      } catch (err) {
        logger.error(err)
      } finally {
        this.isLoading = false
      }
    },
    switchScheduleZone(task_id: number, schedule_zone: TaskScheduleZoneConfig) {
      const { fetchData } = this
      Modal.confirm({
        title: '[警告] 切换调度区域',
        content: `确认要将任务 [${task_id}] 切换到 [${schedule_zone}吗]？`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.SWITCH_SCHEDULE_ZONE, {
              schedule_zone,
              task_id,
              token: useAuthStore().token,
            })
            message.success(msg)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response.data.msg
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
          }
        },
      })
    },
    suspendTask(task_id: number) {
      const { fetchData } = this
      Modal.confirm({
        title: '[警告] 打断任务',
        content: `确认要将任务 [${task_id}] 打断吗？`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.SUSPEND_TASK, {
              id: task_id,
              token: useAuthStore().token,
            })
            message.success(msg)
            fetchData()
          } catch (err) {
            const errMsg = (err as any).response.data.msg
            if (errMsg) {
              logger.error(errMsg)
              message.error(errMsg)
            }
          }
        },
      })
    },
  },
})
