<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import { Table } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import NodeList from '@/components/NodeList.vue'
import { COLORS_CHART, PRIORITY_ICON_CLASS } from '@/constants'
import type { TaskScheduleZone, TasksDataItem } from '@/data'
import { TaskPriority, isQueuedTask } from '@/data'
import { copyWithTip } from '@/utils'
import { formatTaskAge } from '@/utils/format'

const props = defineProps<{
  tasks: TasksDataItem[]
  allExpanded?: boolean
}>()

const renderScheduleZone = (record: TasksDataItem): TaskScheduleZone | null => {
  if (isQueuedTask(record)) return null
  return record.scheduleZone
}

const columns = computed(() => {
  const cols: TableColumnsType<TasksDataItem> = [
    {
      title: '任务 ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '容器名',
      dataIndex: 'nb_name',
      width: 90,
      resizable: true,
    },
    {
      title: '节点数',
      dataIndex: 'nodes',
      width: 40,
    },
    {
      title: '时长',
      dataIndex: 'createdAt',
      width: 60,
    },
    {
      title: 'CPU (core)',
      dataIndex: ['config_json', 'cpu'],
      width: 60,
    },
    {
      title: 'Memory (G)',
      dataIndex: ['config_json', 'memory'],
      width: 60,
    },
    {
      title: 'Environment',
      dataIndex: 'backend',
      width: 120,
    },
  ]
  return cols
})

const isExclusiveTask = (task: TasksDataItem): boolean => {
  return task.nodesList.length > 0 && task.nodesList[0]?.currentStatus === 'exclusive'
}

const copyId = (e: Event, id: string): void => {
  // 阻止展开行事件
  e.stopPropagation()
  copyWithTip(id)
}

const expandedRowKeys = ref<number[]>([])
watch(
  () => props.allExpanded,
  (allExpanded) => {
    expandedRowKeys.value = allExpanded ? props.tasks.map((t) => t.id) : []
  },
)
</script>

<template>
  <Table
    v-model:expanded-row-keys="expandedRowKeys"
    class="users-training-drawer"
    :columns="columns"
    :data-source="tasks"
    :pagination="false"
    :scroll="{ y: 640 }"
    row-key="id"
    :expand-row-by-click="true"
    :row-expandable="(record) => !isQueuedTask(record)"
    :expand-fixed="true"
    :show-expand-column="false"
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'createdAt'">
        {{ formatTaskAge(record.createdAt) }}
      </template>
      <template v-else-if="column.dataIndex === 'scheduleZone'">
        {{ renderScheduleZone(record) }}
      </template>
      <template v-else-if="column.dataIndex === 'nb_name'">
        <div class="flex flex-row gap-1 items-center truncate">
          <span
            class="w-16px h-16px block flex-shrink-0"
            :class="PRIORITY_ICON_CLASS[(record.autoPriority ?? record.priority) as TaskPriority]"
          />
          <span
            v-if="isExclusiveTask(record)"
            class="font-bold"
            :style="`color: ${COLORS_CHART.YELLOW}`"
            >独占</span
          >
          <span class="truncate" :title="text">{{ text }}</span>
        </div>
      </template>
      <template v-else-if="column.dataIndex === 'id'">
        <span
          class="text-slate-5 font-12px hover-bg-slate-200 p-1"
          :title="text"
          @click="(e) => copyId(e, text)"
        >
          {{ text }}
        </span>
      </template>
      <template v-else>
        <span class="truncate" :title="text">{{ text }}</span>
      </template>
    </template>
    <template #expandedRowRender="{ record }">
      <div class="ml-2 font-semibold">{{ record.nb_name }}</div>
      <NodeList class="m-2" :nodes="record.nodesList" />
    </template>
  </Table>
</template>
<style>
.users-training-drawer .ant-table-cell {
  padding: 8px 3px !important;
}
.users-training-drawer .ant-table-row {
  cursor: pointer;
}
</style>
