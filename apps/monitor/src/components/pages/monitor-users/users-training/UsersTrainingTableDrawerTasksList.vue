<script setup lang="ts">
import { useConfig } from '@/composables'
import type { TasksDataItem, TasksQueueTrainingType } from '@/data'
import { isQueuedTask, usersTrainingDetailColumns } from '@/data'
import { useAuthStore, useTasksStore } from '@/stores'
import { AdminGroup } from '@hai-platform/shared'
import { computed, onUpdated, ref, watch } from 'vue'
import UserTrainingTableDrawerTaskListHeader from './UserTrainingTableDrawerTaskListHeader.vue'
import UserTrainingTableDrawerTaskListRow from './UserTrainingTableDrawerTaskListRow.vue'

const props = defineProps<{
  tasks: TasksDataItem[]
  allExpanded?: boolean
  taskType: TasksQueueTrainingType
  rescheduleZone: (id: number) => void
}>()
const { userTrainingDetailTableColumnKeys } = useConfig()
const tasksStore = useTasksStore()
const canSwitchTask = computed(() => useAuthStore().checkUserGroup(AdminGroup.SWITCH_TASK))
const canSuspendTask = computed(() => useAuthStore().checkUserGroup(AdminGroup.SUSPEND_TASK))

const expandedIDs = ref<Record<number, number>>({})

const records = computed(() =>
  props.tasks.map((t) => ({ ...t, size: expandedIDs.value[t.id] ?? 38 })),
)

const columns = computed(() => {
  return usersTrainingDetailColumns.filter((item) =>
    userTrainingDetailTableColumnKeys.value.includes(item.key?.toString() ?? ''),
  )
})

const columnIndexes = computed(() => columns.value.map((c) => String(c.dataIndex) ?? ''))
const fixedWidth = computed(() => columns.value.reduce((c1, c2) => c1 + Number(c2.width ?? 0), 0))

const isOverflow = ref(false)
onUpdated(() => {
  const list = document.getElementById('users-training-drawer-list')
  if (list) {
    isOverflow.value = list.scrollHeight > list.clientHeight
  }
})

const getTaskItemHeight = (t: TasksDataItem): number => {
  return Math.ceil(t.nodes / 5) * 42 + 86
}

const handleExpand = (expanded: boolean, id: number): void => {
  const target = props.tasks.find((t) => t.id === id)
  if (!target) return
  if (expanded) expandedIDs.value[id] = getTaskItemHeight(target)
  else delete expandedIDs.value[id]
}

watch(
  () => props.allExpanded,
  (allExpanded) => {
    if (allExpanded) {
      const newExpandedIDs: Record<number, number> = {}
      for (const t of props.tasks) {
        if (!isQueuedTask(t)) {
          newExpandedIDs[t.id] = getTaskItemHeight(t)
        }
      }
      expandedIDs.value = newExpandedIDs
    } else {
      expandedIDs.value = {}
    }
  },
)
</script>

<template>
  <div class="users-training-drawer flex-1 flex flex-col">
    <UserTrainingTableDrawerTaskListHeader
      :columns="columns"
      :overflow="isOverflow"
      :can-suspend-task="canSuspendTask"
    />
    <RecycleScroller
      id="users-training-drawer-list"
      class="h-720px"
      :items="records"
      :emit-update="true"
      key-field="id"
    >
      <template #default="{ item }"
        ><UserTrainingTableDrawerTaskListRow
          :column-indexes="columnIndexes"
          :fixed-width="fixedWidth"
          :record="item"
          :expand="expandedIDs[item.id]"
          :can-switch-task="canSwitchTask"
          :can-suspend-task="canSuspendTask"
          :reschedule-zone="canSwitchTask ? rescheduleZone : null"
          :suspend-task="canSuspendTask ? tasksStore.suspendTask : null"
          @handle-expand="handleExpand"
        />
      </template>
    </RecycleScroller>
  </div>
</template>
