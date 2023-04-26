<!-- eslint-disable no-nested-ternary -->
<script setup lang="ts">
import {
  AdminGroup,
  UserRole,
  getDefaultTrainingGroup,
  priorityToNumber,
} from '@hai-platform/shared'
import {
  Alert,
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Select,
  SelectOption,
  Table,
  TableSummary,
  TableSummaryCell,
  TableSummaryRow,
  message,
} from 'ant-design-vue'
import type { TableProps } from 'ant-design-vue'
import { get } from 'lodash'
import { storeToRefs } from 'pinia'
import type { UnwrapRef } from 'vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useConfig } from '@/composables'
import { OPTION_VALUE_ALL, PRIORITY_NAME_ICON_CLASS, TaskTrainingType } from '@/constants'
import type {
  TasksQueueTrainingType,
  UsersTrainingRowDataItem,
  UsersTrainingStatisticsTaskType,
  UsersTrainingUsersDataItem,
} from '@/data'
import {
  TASK_PRIORITY_NAMES_ALL,
  TaskPriorityName,
  filterKeys,
  getConfigColumnsWithParents,
  usersTrainingPrioritiesKeys,
} from '@/data'
import { useAuthStore } from '@/stores'
import type { PriorityEditFormState } from '@/stores/user-quota'
import { useUserQuotaStore } from '@/stores/user-quota'
import { formatBytes } from '@/utils'
import { getColumns } from './users-training-table-columns'
import UsersTrainingTableDrawer from './UsersTrainingTableDrawer.vue'

type TaskTrainingFilterTypes = { userRoleType: '_ALL_' | UserRole; userSearch: string }

const props = defineProps<{
  data: UsersTrainingUsersDataItem[]
  taskType: TaskTrainingType
  opt: TaskTrainingFilterTypes
}>()

const userQuotaStore = useUserQuotaStore()
const { userQuotaDict, groupList } = storeToRefs(userQuotaStore)
const { showAdminMode, userTrainingTasksTableColumnsKeys1 } = useConfig()
const drawerVisible = ref(false)

const canEditInternalQuota = computed(() =>
  useAuthStore().checkUserGroup(AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR),
)
const canEditExternalQuota = computed(() =>
  useAuthStore().checkUserGroup(AdminGroup.EXTERNAL_QUOTA_EDITOR),
)

const rowKey = 'user_id'
const isCPU = computed(() => props.taskType === TaskTrainingType.CPU)
const isGPU = computed(() => props.taskType === TaskTrainingType.GPU)
const quotaGroup = ref(getDefaultTrainingGroup())
const groupedUserQuota = computed(() => userQuotaDict.value?.[quotaGroup.value])
const drawerData = ref<UsersTrainingRowDataItem>()
const mappedDrawerData = computed(() =>
  props.data.find((item) => item.user_name === drawerData.value?.user_name),
)

const refreshTableItems = (tasks: UsersTrainingUsersDataItem[]): UsersTrainingRowDataItem[] => {
  return Array.from(tasks)
    .map((item) => ({ ...item, quota: groupedUserQuota.value?.[item.user_name] }))
    .sort(
      (a, b) =>
        b.statistics.nodes.all[isCPU.value ? 'cpu' : 'gpu'] -
        a.statistics.nodes.all[isCPU.value ? 'cpu' : 'gpu'],
    ) as UsersTrainingRowDataItem[]
}

const filterTableItems = (
  tasks: UsersTrainingUsersDataItem[],
  opt: TaskTrainingFilterTypes,
): UsersTrainingUsersDataItem[] => {
  let cached = tasks
  if (opt.userSearch) {
    const searchString = opt.userSearch.toLowerCase()
    cached = cached.filter(
      ({ user_name, nick_name }) =>
        user_name.includes(searchString) || nick_name.includes(searchString),
    )
  }
  if (opt.userRoleType && opt.userRoleType !== '_ALL_') {
    cached = cached.filter((t) => t.role === opt.userRoleType)
  }
  return cached
}

const configColumnsWithParents = computed(() =>
  getConfigColumnsWithParents(
    useAuthStore().isAdmin && showAdminMode.value
      ? userTrainingTasksTableColumnsKeys1.value.filter((k) => !k.includes('io_'))
      : userTrainingTasksTableColumnsKeys1.value,
  ),
)
const taskTypeKeys = {
  [TaskTrainingType.GPU]: 'gpu',
  [TaskTrainingType.CPU]: 'cpu',
  [OPTION_VALUE_ALL]: 'total',
} as Record<TasksQueueTrainingType, UsersTrainingStatisticsTaskType>

const flattenTableItemContent = (item: UsersTrainingRowDataItem) => {
  const content = Object.fromEntries(
    configColumnsWithParents.value
      .map((col) => [
        col.key,
        col.dataIndex
          ? get(
              item,
              col.dataIndex.map((index) =>
                index === '%TYPE%' ? taskTypeKeys[props.taskType] : index,
              ),
            )
          : null,
      ])
      .concat([
        ['role', item.role],
        ['user_name', item.user_name],
        ['tasks', item.tasks],
      ])
      .concat(
        TASK_PRIORITY_NAMES_ALL.filter((pName) => pName !== TaskPriorityName.AUTO).map((pName) => [
          `quota__${pName}`,
          item.quota?.[priorityToNumber(pName)]?.node ?? 0,
        ]),
      ),
  )

  return content
}

const tableItems = computed(() => {
  const items = refreshTableItems(filterTableItems(props.data, props.opt)).map((item) =>
    flattenTableItemContent(item),
  )
  return items
})

const sortDirections: TableProps<UsersTrainingRowDataItem>['sortDirections'] = ['descend']

const showDrawer = (userData: UsersTrainingRowDataItem): void => {
  drawerData.value = userData
  drawerVisible.value = true
}

const onDrawerClose = (): void => {
  drawerVisible.value = false
}
const customRow: TableProps<UsersTrainingRowDataItem>['customRow'] = (userData) => ({
  class: 'cursor-pointer',
  onClick: () => showDrawer(userData),
})

const filteredColumns = computed(() => {
  return filterKeys(
    getColumns({
      drawerVisible: drawerVisible.value,
      quotaGroup: quotaGroup.value,
      taskType: props.taskType,
      isGPU: isGPU.value,
    }),
    configColumnsWithParents.value,
  )
})

const getSumByDataIndex = (
  dataSource: UsersTrainingRowDataItem[],
  dataIndex: string,
): number | string => {
  if (dataIndex.startsWith('quota__')) {
    const priority = Number(dataIndex[1])
    let nodesSum = 0
    for (const u in groupedUserQuota.value) {
      nodesSum += groupedUserQuota.value?.[u]?.[priority]?.node ?? 0
    }
    return nodesSum
  }
  if (dataIndex.includes('io_')) {
    const ioSum = dataSource.reduce((prev, cur) => prev + get(cur, dataIndex), 0)
    return ioSum > 0 ? formatBytes(ioSum) : '--'
  }
  let ret = dataSource.reduce((prev, cur) => prev + get(cur, dataIndex), 0)
  if (dataIndex.includes('tasks') || dataIndex.includes('nodes')) {
    const autoDataIndex = [...dataIndex.slice(0, -1), 'auto']
    ret += dataSource.reduce((prev, cur) => prev + get(cur, autoDataIndex), 0)
  }
  return ret
}

const getChildrenColData = (
  totalRowData: (string | number)[],
  cols: any[],
  dataSource: UsersTrainingRowDataItem[],
): void => {
  for (const col of cols) {
    if (col.children) {
      getChildrenColData(totalRowData, col.children, dataSource)
    } else if (col.dataIndex) {
      totalRowData.push(getSumByDataIndex(dataSource, col.dataIndex))
    }
  }
}

const totalRow = computed(() => {
  const totalRowData = ['总计'] as (string | number)[]
  getChildrenColData(
    totalRowData,
    filteredColumns.value.slice(1),
    tableItems.value as UsersTrainingRowDataItem[],
  )
  return totalRowData
})

const priorityEditVisible = ref(false)
const priorityEditState: UnwrapRef<PriorityEditFormState> = reactive({
  group: '',
  username: '',
  priority: TaskPriorityName.AUTO,
  quota: 0,
})
const openPriorityEdit = (record: UsersTrainingRowDataItem, priority: TaskPriorityName): void => {
  if (
    record.role === UserRole.INTERNAL &&
    !useAuthStore().checkUserGroup(AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR)
  )
    return
  if (
    record.role === UserRole.EXTERNAL &&
    !useAuthStore().checkUserGroup(AdminGroup.EXTERNAL_QUOTA_EDITOR)
  )
    return
  priorityEditState.group = quotaGroup.value
  priorityEditState.username = record.user_name
  priorityEditState.priority = priority
  priorityEditState.quota =
    groupedUserQuota.value?.[record.user_name]?.[priorityToNumber(priority)]?.limit
  priorityEditVisible.value = true
}
const submitPriorityEdit = async (): Promise<void> => {
  if (!priorityEditState.group) {
    message.error('分组不能为空')
    return
  }
  if (!priorityEditState.username) {
    message.error('用户不能为空')
    return
  }
  if (!priorityEditState.quota) {
    message.error('Quota 不能为空')
    return
  }
  priorityEditVisible.value = false
  const hide = message.loading('正在提交 Quota 修改', 0)
  try {
    await userQuotaStore.updateQuota(priorityEditState)
    message.success('修改成功')
  } catch (e) {
    message.error('修改 Quota 失败')
  } finally {
    hide()
  }
}

onMounted(() => {
  const firstElement = tableItems.value?.[0]
  if (firstElement) {
    drawerData.value = firstElement as UsersTrainingRowDataItem
  }
})

watch([tableItems, drawerData], ([newSortedData, newDrawerData]) => {
  if (!newSortedData || !newSortedData.length) drawerData.value = undefined
  const selectedUser = newSortedData.find((d) => d.user_name === newDrawerData?.user_name)
  if (!newDrawerData || !selectedUser) {
    if (showAdminMode) drawerVisible.value = false
    else drawerData.value = newSortedData?.[0] as UsersTrainingRowDataItem
  } else {
    drawerData.value = selectedUser as UsersTrainingRowDataItem
  }
  drawerVisible.value = !!selectedUser
})
</script>

<template>
  <div class="flex w-full flex-row justify-end h-fit">
    <div
      ref="tableContainer"
      class="flex-shrink h-fit"
      :style="{ width: drawerVisible ? 'calc(100% - 800px)' : '100%' }"
    >
      <Table
        bordered
        :columns="filteredColumns"
        :custom-row="customRow"
        :data-source="tableItems"
        :pagination="false"
        :row-key="rowKey"
        :row-class-name="
          (record) => (record?.user_name == drawerData?.user_name ? 'user-view-selected-row' : '')
        "
        :scroll="{ y: 800 }"
        size="small"
        :sort-directions="sortDirections"
        table-layout="fixed"
      >
        <template #headerCell="{ title, column }">
          <!-- 优先级图标作为 header -->
          <template v-if="TASK_PRIORITY_NAMES_ALL.includes(title)">
            <div class="flex justify-center items-center" :title="title">
              <span :class="PRIORITY_NAME_ICON_CLASS[title as TaskPriorityName]" />
            </div>
          </template>
          <template v-if="column.key === 'quota_group'">
            <div class="quota-group-select">
              <Select
                v-model:value="quotaGroup"
                style="width: 100%"
                :options="groupList.map((g) => ({ value: g, label: g }))"
              ></Select>
            </div>
          </template>
        </template>

        <template #bodyCell="{ column, record, value }">
          <!-- 查看 / 修改 Quota -->
          <template v-if="(column?.key as string).startsWith('quota__') ">
            <div class="quota-cell">
              <Button
                type="link"
                class="left--3 hover:bg-hover-light hover:z-2"
                title="当前/上限"
                :disabled="
                  (record.role === UserRole.INTERNAL && !canEditInternalQuota) ||
                  (record.role === UserRole.EXTERNAL && !canEditExternalQuota)
                "
                @click.stop="openPriorityEdit(record, column?.title)"
              >
                {{
                  groupedUserQuota?.[record.user_name]?.[priorityToNumber(column.title)]?.node ||
                  '-'
                }}
                /
                {{
                  groupedUserQuota?.[record.user_name]?.[priorityToNumber(column.title)]?.limit ||
                  '-'
                }}
              </Button>
            </div>
          </template>
          <template v-if="value === 0"> <span></span></template>
        </template>
        <template #summary>
          <TableSummary fixed>
            <TableSummaryRow>
              <TableSummaryCell
                v-for="(cell, index) in totalRow"
                :key="`summary-${index}`"
                :index="index"
              >
                <div class="text-center">{{ cell }}</div>
              </TableSummaryCell>
            </TableSummaryRow>
          </TableSummary>
        </template>
      </Table>
    </div>
    <div v-if="drawerVisible && mappedDrawerData" class="flex-grow w-800px">
      <UsersTrainingTableDrawer
        :data="mappedDrawerData"
        :visible="drawerVisible"
        :task-type="taskType"
        @close="onDrawerClose"
      />
    </div>
    <Modal v-model:visible="priorityEditVisible" title="修改Quota上限" @ok="submitPriorityEdit">
      <div class="mb-4">
        <Alert message="内部用户的quota可以自行设定, 此处修改的是[ 上限 ]" type="info" show-icon />
      </div>
      <Form :model="priorityEditState" :label-col="{ span: 4 }">
        <FormItem label="分组"><Input :value="priorityEditState.group" disabled /></FormItem>
        <FormItem label="用户"><Input :value="priorityEditState.username" disabled /></FormItem>
        <FormItem label="优先级">
          <Select v-model:value="priorityEditState.priority">
            <SelectOption v-for="p in usersTrainingPrioritiesKeys" :key="p" :value="p">{{
              p
            }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="配额上限"
          ><InputNumber v-model:value="priorityEditState.quota" :min="0" style="width: 100%"
        /></FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style>
.hide-sorter .ant-table-column-sorter {
  display: none;
}

.ant-table-column-sort,
.user-view-selected-row {
  background: var(--shadow-3) !important;
}

.right-bold-border {
  border-right: 5px solid var(--border-color-split) !important;
}

.compact-padding {
  padding: 2px !important;
}

tfoot.ant-table-summary > tr > td.ant-table-cell {
  padding: 8px 2px !important;
}

.quota-group-select .ant-select-selector {
  border: 0 !important;
}

.quota-cell {
  overflow: hidden;
}

.quota-cell:hover {
  overflow: visible;
}
.quota-cell:hover button {
  background-color: white;
  box-shadow: inset 0px 0px 0px 10px rgba(255, 255, 255, 20%);
}
</style>
