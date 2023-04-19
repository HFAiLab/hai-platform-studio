import type { NodesOverview } from '@hai-platform/client-api-server'
import type { Node } from '@hai-platform/shared'
import { Modal, message } from 'ant-design-vue'
import { defineStore } from 'pinia'
import type { NodesNameMap } from '@/data'
import { getNodesData, getNodesNameMap } from '@/data'
import { ApiServerApiName, apiServerClient } from '@/services'
import { logger } from '@/utils'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'

interface NodesOverviewState {
  /**
   * 节点详情
   */
  nodes: Node[]

  /**
   * 节点概览
   */
  overview: NodesOverview | null

  /**
   * 是否已初始化
   */
  isInitialized: boolean

  /**
   * 是否正在获取数据
   */
  isLoading: boolean
}

export const useNodesOverviewStore = defineStore('nodes-overview', {
  state: (): NodesOverviewState => ({
    nodes: [],
    overview: null,
    isInitialized: false,
    isLoading: false,
  }),

  getters: {
    nodesData: (state) =>
      getNodesData(state.nodes, {
        usersNameMap: useUsersStore().usersNameMap,
      }),

    /**
     * key 为节点名，value 为 nodeData 对象的 map
     */
    nodesNameMap(): NodesNameMap {
      return getNodesNameMap(this.nodesData)
    },
  },

  actions: {
    /**
     * 调用接口并更新数据
     */
    async fetchData() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const { nodes, overview } = await apiServerClient.request(
          ApiServerApiName.GET_NODES_OVERVIEW,
          { token: useAuthStore().token },
        )
        this.nodes = nodes
        this.overview = overview
        this.isInitialized = true
      } catch (err) {
        logger.error(err)
      } finally {
        this.isLoading = false
      }
    },
    changeNodeState(node_name: string, state: 'enabled' | 'disabled') {
      const { fetchData } = this
      Modal.confirm({
        title: `[警告] ${state === 'disabled' ? '禁用' : '恢复'}节点`,
        content: `确认要${state === 'disabled' ? '禁用' : '恢复'}节点 [${node_name}] 吗？`,
        async onOk() {
          try {
            const { msg } = await apiServerClient.request(ApiServerApiName.CHANGE_NODE_STATE, {
              node_name,
              state,
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
