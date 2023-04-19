<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UsersJupyterUsersDataItem } from '@/data'
import UsersJupyterTableDrawerTasksList from './UsersJupyterTableDrawerTasksList.vue'

const props = defineProps<{
  data: UsersJupyterUsersDataItem
  visible: boolean
}>()

const emit = defineEmits(['close'])

const containerOrNodeSearch = ref<string>('')
const filteredTableData = computed(() => {
  if (!containerOrNodeSearch.value) return props.data.tasks
  const searchString = containerOrNodeSearch.value.toLowerCase()
  return props.data.tasks.filter(
    ({ assigned_nodes, nb_name }) =>
      assigned_nodes.find((n) => n.includes(searchString)) ||
      nb_name.toLowerCase().includes(searchString),
  )
})

const sortedTasks = computed(() =>
  Array.from(filteredTableData.value).sort((a, b) => a.first_id - b.first_id),
)
</script>

<template>
  <div class="p-4">
    <div class="flex flex-row justify-between">
      <div class="text-16px font-bold m-1">用户任务详情</div>
      <div
        class="i-ant-design:close-outlined cursor-pointer text-secondary hover:text-main"
        @click="emit('close')"
      ></div>
    </div>
    <div class="flex flex-row justify-between m-3">
      <div>用户名：{{ data.usernameDisplay }}</div>
      <div>中文名：{{ data.nick_name }}</div>
      <div>任务数：{{ data.tasks.length }}</div>
      <div>节点数：{{ data.tasks.reduce((pre, cur) => pre + cur.assigned_nodes.length, 0) }}</div>
    </div>
    <UsersJupyterTableDrawerTasksList :tasks="sortedTasks" :all-expanded="true" />
  </div>
</template>
