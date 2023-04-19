<script setup lang="ts">
import NodeList from '@/components/NodeList.vue'
import { useConfig } from '@/composables'
import { PRIORITY_ICON_CLASS } from '@/constants'
import type { TaskPriority, TaskScheduleZone, TasksDataItem } from '@/data'
import { isQueuedTask } from '@/data'
import { copyWithTip } from '@/utils'
import { formatTaskAge } from '@/utils/format'
import { convertClientGroupToDisplay, TaskChainStatus } from '@hai-platform/shared'
import { Button } from 'ant-design-vue'

const props = defineProps<{
  columnIndexes: string[]
  fixedWidth: number
  expand?: number
  record: TasksDataItem
  canSwitchTask: boolean
  canSuspendTask: boolean
  rescheduleZone: ((id: number) => void) | null
  suspendTask: ((task_id: number) => void) | null
}>()

const { showAdminMode } = useConfig()

const emit = defineEmits<{
  (event: 'handleExpand', expanded: boolean, id: number): void
}>()

const copyId = (e: Event, id: string): void => {
  // 阻止展开行事件
  e.stopPropagation()
  copyWithTip(id)
}

const getTaskPriorityIconClass = (record: TasksDataItem): string => {
  return PRIORITY_ICON_CLASS[(record.autoPriority ?? record.priority) as TaskPriority]
}

const getTaskStatusIconClass = (record: TasksDataItem): string => {
  // 因为拿的是 running tasks, 所以没有 finished
  switch (record.chain_status) {
    case TaskChainStatus.WAITING_INIT:
      return 'i-hai-platform-status-waiting-init'
    case TaskChainStatus.SUSPENDED:
      return 'i-hai-platform-status-suspended'
    case TaskChainStatus.RUNNING:
      return 'i-hai-platform-status-running'
    default:
      return ''
  }
}

const renderScheduleZone = (record: TasksDataItem): TaskScheduleZone | null => {
  if (isQueuedTask(record)) return null
  return record.scheduleZone
}

const toggleNodeList = (): void => {
  if (isQueuedTask(props.record)) return
  if (!props.expand) {
    // expand
    emit('handleExpand', true, props.record.id)
  } else {
    // fold
    emit('handleExpand', false, props.record.id)
  }
}
</script>
<template>
  <div>
    <div
      class="users-training-drawer-list-item w-full flex items-center py-8px cursor-pointer hover-bg-light"
      style="border-bottom: 1px solid var(--border-color-split)"
      @click="toggleNodeList"
    >
      <!-- 任务 ID -->
      <div v-if="columnIndexes.includes('id')" style="width: 70px; flex-shrink: 0">
        <span
          class="text-slate-5 font-12px hover-bg-slate-200 p-1"
          :title="String(record.id)"
          @click="(e) => copyId(e, String(record.id))"
        >
          {{ record.id }}
        </span>
      </div>
      <!-- 任务名 -->
      <div
        v-if="columnIndexes.includes('nb_name')"
        :style="`width: calc(100% - ${fixedWidth + (showAdminMode ? 22 : 0)}px)`"
      >
        <div class="flex flex-row gap-1 items-center truncate">
          <div
            class="w-10px h-10px block flex-shrink-0"
            :class="getTaskStatusIconClass(record)"
            :title="record.chain_status"
          />
          <div
            class="w-16px h-16px block flex-shrink-0"
            :class="getTaskPriorityIconClass(record)"
            :title="String(record.autoPriority ?? record.priority)"
          />
          <div
            v-if="record.runtime_config_json.scheduler_assign_rule === 0"
            class="w-16px h-16px block flex-shrink-0 i-carbon:center-circle"
            title="权利数内的任务"
          />
          <div class="truncate" :title="record.nb_name">{{ record.nb_name }}</div>
        </div>
      </div>
      <!-- 区域 -->
      <div
        v-if="columnIndexes.includes('scheduleZone')"
        :title="canSwitchTask ? '切换schedule zone' : ''"
        class="flex-shrink-0 text-center overflow-hidden"
        style="width: 35px"
        @click="rescheduleZone && rescheduleZone(record.id)"
      >
        <div
          :class="showAdminMode && canSwitchTask ? 'hover:bg-hover-light' : ''"
          style="width: 25px"
        >
          <Button
            :disabled="showAdminMode && !canSwitchTask"
            :type="canSwitchTask ? 'link' : 'text'"
            size="small"
          >
            {{ renderScheduleZone(record) }}
          </Button>
        </div>
      </div>
      <!-- 提交组 -->
      <div v-if="columnIndexes.includes('client_group')" style="width: 78px; flex-shrink: 0">
        <div class="truncate" :title="record.client_group">
          {{ convertClientGroupToDisplay(record.client_group) }}
        </div>
      </div>
      <!-- 节点 -->
      <div
        v-if="columnIndexes.includes('nodes')"
        style="width: 35px; flex-shrink: 0; text-align: center"
      >
        {{ record.nodes }}
      </div>
      <!-- 时长 -->
      <div
        v-if="columnIndexes.includes('createdAt')"
        style="width: 60px; flex-shrink: 0; text-align: center"
      >
        {{ formatTaskAge(record.createdAt) }}
      </div>

      <div
        v-if="showAdminMode"
        style="width: 22px; flex-shrink: 0"
        class="flex-shrink-0 text-center relative overflow-hidden"
        :class="canSwitchTask ? 'hover:bg-hover-light' : ''"
      >
        <Button
          :disabled="!canSuspendTask"
          type="text"
          size="small"
          title="打断任务"
          class="absolute left--1"
          @click="showAdminMode && suspendTask && suspendTask(record.id)"
        >
          <div class="i-carbon:pause-filled" :class="canSuspendTask ? 'text-primary' : ''"></div>
        </Button>
      </div>
    </div>
    <div
      v-if="!isQueuedTask(record) && expand"
      class="p-2"
      style="background-color: var(--background-color-light)"
    >
      <div class="ml-2 font-semibold">{{ record.nb_name }}</div>
      <NodeList class="m-2" :nodes="record.nodesList" :ref-task-id="record.id" />
    </div>
  </div>
</template>
