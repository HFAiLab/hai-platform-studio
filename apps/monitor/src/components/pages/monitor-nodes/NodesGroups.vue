<script setup lang="ts">
import { Empty } from 'ant-design-vue'
import { computed, ref } from 'vue'
import DataCard from '@/components/DataCard.vue'
import WrappedInputSearch from '@/components/WrappedInputSearch.vue'
import { useConfig } from '@/composables'
import { getNodesGroupsTree } from '@/data'
import { useNodesOverviewStore } from '@/stores'
import NodesGroupsCurrentStatusSelect from './nodes-groups/NodesGroupsCurrentStatusSelect.vue'
import NodesGroupsMaxDisplayedNodesCountInput from './nodes-groups/NodesGroupsMaxDisplayedNodesCountInput.vue'
import NodesGroupsTree from './nodes-groups/NodesGroupsTree.vue'

const { nodesGroupsMaxDisplayedNodesCount, nodesGroupsCurrentStatus } = useConfig()
const nodesOverviewStore = useNodesOverviewStore()

const title = '节点分组'
const isLoading = computed(() => !nodesOverviewStore.isInitialized)

// 节点状态筛选
const currentStatusFilteredNodes = computed(() => {
  if (nodesGroupsCurrentStatus.value.length === 0) return nodesOverviewStore.nodesData
  return nodesOverviewStore.nodesData.filter((item) =>
    nodesGroupsCurrentStatus.value.includes(item.currentStatus),
  )
})

// 节点搜索筛选
const searchFilter = ref('')
const searchFilteredNodes = computed(() => {
  if (!searchFilter.value) return currentStatusFilteredNodes.value
  const searchString = searchFilter.value.toLowerCase()
  return currentStatusFilteredNodes.value.filter(
    ({ mars_group, name, working_user, spine, leaf }) => {
      if (mars_group?.includes(searchString) || name.includes(searchString)) {
        return true
      }
      if (working_user?.includes(searchString)) {
        return true
      }
      if (
        spine?.toLocaleLowerCase().includes(searchString) ||
        leaf?.toLocaleLowerCase().includes(searchString)
      ) {
        return true
      }
      return false
    },
  )
})

// 节点分组树数据
const nodesGroupsTree = computed(() => getNodesGroupsTree(searchFilteredNodes.value))
</script>

<template>
  <DataCard :is-loading="isLoading" :title="title">
    <template #extra>
      <div class="flex flex-row gap-4 items-center text-secondary">
        <!-- 节点状态筛选 -->
        <NodesGroupsCurrentStatusSelect
          v-model:value="nodesGroupsCurrentStatus"
          class="min-w-150px"
        />

        <!-- 节点最大展示数量配置 -->
        <NodesGroupsMaxDisplayedNodesCountInput
          v-model:value="nodesGroupsMaxDisplayedNodesCount"
          class="w-170px"
        />
        <!-- 节点搜索筛选 -->
        <WrappedInputSearch
          v-model:value="searchFilter"
          class="w-230px"
          placeholder="搜索分组/节点/用户"
        />
      </div>
    </template>

    <!-- 节点分组树 -->
    <template v-if="nodesGroupsTree.length">
      <NodesGroupsTree
        :data="nodesGroupsTree"
        :max-displayed-nodes-count="nodesGroupsMaxDisplayedNodesCount"
      />
    </template>
    <template v-else>
      <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </template>
  </DataCard>
</template>
