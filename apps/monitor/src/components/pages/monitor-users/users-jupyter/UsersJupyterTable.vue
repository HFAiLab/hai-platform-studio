<script setup lang="ts">
import type { UserRole } from '@hai-platform/shared'
import { Table } from 'ant-design-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { ref, watchEffect } from 'vue'
import type { UsersJupyterUsersDataItem } from '@/data'
import UsersJupyterTableDrawer from './UsersJupyterTableDrawer.vue'

const props = defineProps<{
  role: UserRole
  data: UsersJupyterUsersDataItem[]
}>()

const rowKey = 'taskId'
const columns = ref<TableColumnsType<UsersJupyterUsersDataItem>>([
  {
    title: '用户名',
    dataIndex: 'nick_name',
    align: 'center',
    ellipsis: true,
    resizable: true,
    width: 100,
    minWidth: 100,
    maxWidth: 300,
    sorter: (a, b) => a.user_name.localeCompare(b.user_name),
  },
  {
    title: 'CPU (core)',
    dataIndex: ['statistics', 'cpu'],
    align: 'center',
    width: 60,
    sorter: (a, b) => a.statistics.cpu - b.statistics.cpu,
  },
  {
    title: 'Memory (G)',
    dataIndex: ['statistics', 'memory'],
    align: 'center',
    width: 60,
    sorter: (a, b) => a.statistics.memory - b.statistics.memory,
  },
  {
    title: '容器数',
    dataIndex: ['statistics', 'tasks'],
    align: 'center',
    width: 50,
    sorter: (a, b) => a.statistics.tasks - b.statistics.tasks,
  },
  {
    title: 'GPU',
    align: 'center',
    children: [
      {
        title: '独占',
        align: 'center',
        width: 50,
        dataIndex: ['statistics', 'gpu', 'exclusive'],
        sorter: (a, b) => a.statistics.gpu.exclusive - b.statistics.gpu.exclusive,
      },
      {
        title: '共用',
        align: 'center',
        width: 50,
        dataIndex: ['statistics', 'gpu', 'shared'],
        sorter: (a, b) => a.statistics.gpu.shared - b.statistics.gpu.shared,
      },
    ],
  },
  {
    title: '独占',
    align: 'center',
    children: [
      {
        title: 'GPU',
        align: 'center',
        width: 50,
        dataIndex: ['statistics', 'exclusive', 'gpu'],
        sorter: (a, b) => a.statistics.exclusive.gpu - b.statistics.exclusive.gpu,
      },
      {
        title: 'CPU',
        align: 'center',
        width: 50,
        dataIndex: ['statistics', 'exclusive', 'cpu'],
        sorter: (a, b) => a.statistics.exclusive.cpu - b.statistics.exclusive.cpu,
      },
    ],
  },
])

const drawerVisible = ref(true)
const drawerData = ref<UsersJupyterUsersDataItem>()
const showDrawer = (userData: UsersJupyterUsersDataItem): void => {
  drawerData.value = userData
  drawerVisible.value = true
}
const onDrawerClose = (): void => {
  drawerVisible.value = false
}
const customRow: TableProps<UsersJupyterUsersDataItem>['customRow'] = (userData) => ({
  class: 'cursor-pointer',
  onClick: () => showDrawer(userData),
})

const onResizeColumn = (
  width: number,
  col: TableColumnsType<UsersJupyterUsersDataItem>[number],
): void => {
  col.width = width
}

watchEffect(() => {
  if (!props.data) drawerData.value = undefined
  const selectedUser = props.data.find((d) => d.user_id === drawerData.value?.user_id)
  if (!drawerData.value || !selectedUser) {
    drawerData.value = props.data?.[0]
  } else {
    drawerData.value = selectedUser
  }
  if (!drawerData.value) drawerVisible.value = false
})
</script>

<template>
  <div class="flex w-full flex-row justify-end h-fit border-b-2 border-b-light">
    <div
      class="flex-shrink h-fit"
      :style="{ width: drawerVisible ? 'calc(100% - 800px)' : '100%' }"
    >
      <Table
        bordered
        :columns="columns"
        :custom-row="customRow"
        :data-source="props.data"
        :pagination="false"
        :row-key="rowKey"
        :row-class-name="
          (record) => (record?.user_name == drawerData?.user_name ? 'user-view-selected-row' : '')
        "
        :scroll="{ y: 700 }"
        size="small"
        :sort-directions="['descend', 'ascend']"
        @resize-column="onResizeColumn"
      ></Table>
    </div>
    <div v-if="drawerVisible && drawerData" class="flex-grow w-800px border-t-2 border-t-light">
      <UsersJupyterTableDrawer
        :data="drawerData ?? []"
        :visible="drawerVisible"
        @close="onDrawerClose"
      />
    </div>
  </div>
</template>
