<script setup lang="ts">
import { TaskPriorityName, isDeprecatedPriorityName } from '@hai-platform/shared'
import TipsPopover from '@/components/TipsPopover.vue'
import TipsPopoverItem from '@/components/TipsPopoverItem.vue'
import type { UsersTraining } from '@/data'

defineProps<{
  usersTraining: UsersTraining
}>()
</script>

<template>
  <TipsPopover>
    <TipsPopoverItem
      class="font-bold mb-2"
      name="训练用户数"
      :value="usersTraining.usersData.length"
    />
    <TipsPopoverItem name="任务数" :value="usersTraining.tasks.length" />
    <template
      v-for="[priority, details] in Object.entries(usersTraining.statistics.tasks)"
      :key="priority"
    >
      <template v-if="priority !== 'all'">
        <!-- deprecated begin -->
        <!-- 已废弃的优先级显示为灰色，且仅在有数据时展示 -->
        <template v-if="isDeprecatedPriorityName(priority as TaskPriorityName)">
          <TipsPopoverItem
            v-if="details.total"
            class="text-secondary"
            :name="priority"
            :value="details.total"
          />
        </template>
        <!-- deprecated end -->

        <template v-else>
          <TipsPopoverItem :name="priority" :value="details.total" />
        </template>
      </template>
    </template>
  </TipsPopover>
</template>
