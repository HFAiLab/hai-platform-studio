<script setup lang="ts">
import { UserRole } from '@hai-platform/shared'
import { computed, onMounted, ref } from 'vue'
import DataCard from '@/components/DataCard.vue'
import WrappedInputSearch from '@/components/WrappedInputSearch.vue'
import { useRefresh } from '@/composables'
import type { UsersJupyterUsersDataItem } from '@/data'
import { getUsersJupyter } from '@/data'
import { useNodesOverviewStore, useTasksStore, useUsersStore, useVersionStore } from '@/stores'
import DataSubCard from '../../DataSubCard.vue'
import UsersJupyterTable from './users-jupyter/UsersJupyterTable.vue'
import UsersJupyterTipsPopover from './users-jupyter/UsersJupyterTipsPopover.vue'

const { refresh, setRefresh } = useRefresh()
const nodesOverviewStore = useNodesOverviewStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()

setRefresh([
  useVersionStore().checkHasNewVersion,
  nodesOverviewStore.fetchData,
  tasksStore.fetchData,
])

refresh()
onMounted(() => usersStore.fetchData())

const title = 'Jupyter 用户'
// 由于用户数据是通过多个部分数据生成的，所以 loading 状态结合判断
const isLoading = computed(
  () => !(nodesOverviewStore.isInitialized && tasksStore.isInitialized && usersStore.isInitialized),
)
const usersJupyter = computed(() =>
  getUsersJupyter(tasksStore.tasks, {
    nodesNameMap: nodesOverviewStore.nodesNameMap,
    usersNameMap: usersStore.usersNameMap,
  }),
)

// 用户搜索筛选
const userOrContainerSearch = ref('')
const filteredData = computed(() => {
  if (!userOrContainerSearch.value) return usersJupyter.value.usersData
  const searchString = userOrContainerSearch.value.toLowerCase()
  return usersJupyter.value.usersData
    .filter(
      ({ user_name, nick_name, tasks }) =>
        user_name.includes(searchString) ||
        nick_name.includes(searchString) ||
        tasks.find(
          (t) =>
            t.nb_name.toLowerCase().includes(searchString) ||
            t.nodesList.find((n) => n.name.includes(searchString)),
        ),
    )
    .map((u) => ({
      ...u,
      tasks: u.tasks.filter(
        (t) =>
          t.nb_name.toLowerCase().includes(searchString) ||
          t.nodesList.find((n) => n.name.includes(searchString)),
      ),
    }))
})

/**
 * 筛选内外部用户
 */
const filterRole = (
  tasks: UsersJupyterUsersDataItem[],
  role: UserRole,
): UsersJupyterUsersDataItem[] => {
  return tasks.filter((t) => t.role === role)
}
</script>

<template>
  <DataCard :is-loading="isLoading" :title="title" :body-style="{ padding: 0 }">
    <template #extra>
      <div class="flex flex-row gap-4 items-center text-secondary">
        <!-- 用户搜索筛选 -->
        <WrappedInputSearch
          v-model:value="userOrContainerSearch"
          class="w-220px"
          placeholder="搜索用户或容器名或节点"
        />
        <!-- 提示信息 -->
        <UsersJupyterTipsPopover :users-jupyter="usersJupyter" />
      </div>
    </template>

    <!-- Jupyter 用户数据表 -->
    <DataSubCard title="内部用户">
      <UsersJupyterTable
        :data="filterRole(filteredData, UserRole.INTERNAL)"
        :role="UserRole.INTERNAL"
      />
    </DataSubCard>
    <DataSubCard title="外部用户">
      <UsersJupyterTable
        :data="filterRole(filteredData, UserRole.EXTERNAL)"
        :role="UserRole.EXTERNAL"
      />
    </DataSubCard>
  </DataCard>
</template>
