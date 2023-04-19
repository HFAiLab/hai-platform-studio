<script setup lang="ts">
import DataCard from '@/components/DataCard.vue'
import WrappedInputSearch from '@/components/WrappedInputSearch.vue'
import { useConfig, useRefresh } from '@/composables'
import { TaskTrainingType } from '@/constants'
import { getUsersTraining, isCPUTask, isGPUTask } from '@/data'
import {
  useAuthStore,
  useNodesOverviewStore,
  useTasksStore,
  useUsersStore,
  useVersionStore,
} from '@/stores'
import type { UserRole } from '@hai-platform/shared'
import { difference } from 'lodash'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QUOTA_COLUMNS } from '../../../constants/default'
import UsersTrainingAdminSwitch from './users-training/UsersTrainingAdminSwitch.vue'
import UsersTrainingColumnsConfig from './users-training/UsersTrainingColumnsConfig.vue'
import UsersTrainingRoleTypeSelect from './users-training/UsersTrainingRoleTypeSelect.vue'
import UsersTrainingTable from './users-training/UsersTrainingTable.vue'
import UsersTrainingTaskTypeSelectVue from './users-training/UsersTrainingTaskTypeSelect.vue'
import UsersTrainingTipsPopover from './users-training/UsersTrainingTipsPopover.vue'

const userTrainingTableRef = ref<InstanceType<typeof UsersTrainingTable> | null>(null)
const { refresh, setRefresh } = useRefresh()

const route = useRoute()
const router = useRouter()
const nodesOverviewStore = useNodesOverviewStore()
const tasksStore = useTasksStore()
const usersStore = useUsersStore()
const { showAllUsers } = useConfig()

setRefresh([
  useVersionStore().checkHasNewVersion,
  nodesOverviewStore.fetchData,
  tasksStore.fetchData,
  usersStore.fetchData,
])

refresh()

const tasksQueueTrainingType = computed(() => {
  const parsed = route.params.type as TaskTrainingType
  const options = [TaskTrainingType.GPU, TaskTrainingType.CPU]
  if (options.includes(parsed)) {
    return parsed
  }
  return TaskTrainingType.GPU
})

const userRoleType = ref<'_ALL_' | UserRole>('_ALL_')

const title = '训练用户'
// 由于用户数据是通过多个部分数据生成的，所以 loading 状态结合判断
const isLoading = computed(
  () => !(nodesOverviewStore.isInitialized && tasksStore.isInitialized && usersStore.isInitialized),
)
const tasksSeries = computed(() => {
  const filterTaskType =
    tasksQueueTrainingType.value === TaskTrainingType.GPU ? isGPUTask : isCPUTask
  return tasksStore.tasks.filter(filterTaskType)
})

const usersTraining = computed(() => {
  const ret = getUsersTraining(
    tasksSeries.value,
    {
      nodesNameMap: nodesOverviewStore.nodesNameMap,
      usersNameMap: usersStore.usersNameMap,
    },
    showAllUsers.value,
  )
  return ret
})

// 用户搜索筛选
const userSearch = ref('')

const { isAdmin } = useAuthStore()
const { userTrainingTasksTableColumnsKeys1 } = useConfig()
onMounted(() => {
  if (!isAdmin) {
    userTrainingTasksTableColumnsKeys1.value = difference(
      userTrainingTasksTableColumnsKeys1.value,
      QUOTA_COLUMNS,
    )
  }
})
</script>

<template>
  <div class="flex flex-row gap-4">
    <UsersTrainingTaskTypeSelectVue
      :value="tasksQueueTrainingType"
      @update:value="(value) => router.push({ params: { type: value } })"
    />
    <UsersTrainingRoleTypeSelect v-model:value="userRoleType" />
    <!-- 用户搜索筛选 -->
    <WrappedInputSearch v-model:value="userSearch" class="w-200px" placeholder="搜索用户" />
  </div>
  <DataCard :is-loading="isLoading" :title="title" :body-style="{ padding: 0 }">
    <template #extra>
      <div class="flex flex-row gap-4 items-center text-secondary">
        <!-- 管理模式按钮 -->
        <UsersTrainingAdminSwitch v-if="useAuthStore().isAdmin" />
        <!-- 训练用户数据表列管理 -->
        <UsersTrainingColumnsConfig />
        <!-- 提示信息 -->
        <UsersTrainingTipsPopover :users-training="usersTraining" />
      </div>
    </template>
    <!-- 任务类型选择框 -->
    <!-- 训练用户数据表 -->
    <UsersTrainingTable
      ref="userTrainingTableRef"
      :data="usersTraining.usersData"
      :task-type="tasksQueueTrainingType"
      :opt="{
        userSearch: userSearch,
        userRoleType: userRoleType,
      }"
    />
  </DataCard>
</template>
