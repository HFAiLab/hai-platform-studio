<script setup lang="ts">
import type { ColumnType } from 'ant-design-vue/lib/table'
import { useConfig } from '@/composables'
import type { TasksDataItem } from '@/data'

defineProps<{
  columns: ColumnType<TasksDataItem>[]
  overflow: boolean
  canSuspendTask: boolean
}>()

const { showAdminMode } = useConfig()
</script>
<template>
  <table class="users-training-drawer w-full" style="table-layout: fixed">
    <colgroup>
      <col
        v-for="col in columns"
        :key="col.key"
        :style="col.width ? `width: ${col.width}px` : ''"
      />
      <col v-if="showAdminMode" style="width: 22px" />
      <col v-if="overflow" style="width: 8px" />
    </colgroup>
    <thead class="ant-table-thead">
      <tr>
        <th
          v-for="(col, index) in columns"
          :key="col.key"
          class="ant-table-cell"
          :colstart="index"
          :colend="index"
        >
          {{ col.title }}
        </th>
        <th v-if="showAdminMode"></th>
        <th v-if="overflow"></th>
      </tr>
    </thead>
  </table>
</template>
