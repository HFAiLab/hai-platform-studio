<script setup lang="ts">
import WrappedInputSearch from '@/components/WrappedInputSearch.vue'
import { useConfig } from '@/composables'
import type { UsersTrainingUsersDataItem } from '@/data'
import { TaskTrainingType } from '@/data'
import { useAuthStore, useTasksStore, useUsersStore } from '@/stores'
import type { TaskScheduleZoneConfig } from '@hai-platform/shared'
import { AdminGroup, convertClientGroupFromDisplay, TaskScheduleZone } from '@hai-platform/shared'
import { useToggle } from '@vueuse/core'
import {
  Button,
  Col,
  Dropdown,
  Menu,
  MenuItem,
  message,
  Modal,
  Radio,
  RadioGroup,
  Row,
} from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'
import UsersTrainingTableDrawerGroupManager from './UsersTrainingTableDrawerGroupManager.vue'
import UsersTrainingTableDrawerTasksList from './UsersTrainingTableDrawerTasksList.vue'

const props = defineProps<{
  data: UsersTrainingUsersDataItem
  visible: boolean
  taskType: TaskTrainingType
}>()

const { showAdminMode } = useConfig()

const taskTypeKey = computed(() => (props.taskType === TaskTrainingType.GPU ? 'gpu' : 'cpu'))

const canBanUser = computed(() => useAuthStore().checkUserGroup(AdminGroup.DEVELOPER_ADMIN))
const canSwitchTask = computed(() => useAuthStore().checkUserGroup(AdminGroup.SWITCH_TASK))
const emit = defineEmits(['close'])

const taskOrGroupSearch = ref<string>('')
const filteredTableData = computed(() => {
  if (!taskOrGroupSearch.value) return props.data.tasks
  const searchString = taskOrGroupSearch.value.toLowerCase()
  return props.data.tasks.filter(
    ({ id, nb_name, client_group }) =>
      id.toString().includes(searchString) ||
      nb_name.includes(searchString) ||
      client_group === convertClientGroupFromDisplay(taskOrGroupSearch.value),
  )
})

const sortedTasks = computed(() =>
  Array.from(filteredTableData.value).sort((a, b) => a.first_id - b.first_id),
)

const [allExpanded, setAllExpanded] = useToggle(false)

watch(
  () => props.data.user_id,
  () => {
    setAllExpanded(false)
  },
)
const { setUserActiveState } = useUsersStore()

interface RescheduleInput {
  type: 'user' | 'task'
  user_name?: string
  task_id?: number
}
const rescheduleVisible = ref<boolean>(false)
const rescheduleInput = reactive<RescheduleInput>({ type: 'task' })
const rescheduleZone = ref<TaskScheduleZoneConfig>(TaskScheduleZone.A)

const openChangeUserScheduleZone = (user_name: string): void => {
  rescheduleVisible.value = true
  rescheduleInput.type = 'user'
  rescheduleInput.user_name = user_name
}

const openChangeTaskScheduleZone = (task_id: number): void => {
  rescheduleVisible.value = true
  rescheduleInput.type = 'task'
  rescheduleInput.task_id = task_id
}

const submitChangeTaskScheduleZone = (): void => {
  if (rescheduleInput.type === 'user' && !rescheduleInput.user_name) {
    message.error('用户名不可为空')
    return
  }
  if (rescheduleInput.type === 'task' && !rescheduleInput.task_id) {
    message.error('任务 ID 不可为空')
    return
  }
  rescheduleVisible.value = false
  if (rescheduleInput.type === 'task')
    useTasksStore().switchScheduleZone(rescheduleInput.task_id!, rescheduleZone.value)
  if (rescheduleInput.type === 'user')
    useUsersStore().switchScheduleZone(rescheduleInput.user_name!, rescheduleZone.value)
}
</script>

<template>
  <div class="p-4 h-full flex flex-col">
    <div class="flex flex-row justify-between">
      <div class="text-16px font-bold m-1">用户任务详情</div>
      <div
        class="i-ant-design:close-outlined cursor-pointer text-secondary hover:text-main"
        @click="emit('close')"
      ></div>
    </div>
    <div class="flex flex-row justify-between p-2">
      <div class="flex flex-row items-center">
        <div>用户名：{{ data.usernameDisplay }}</div>
        <div v-if="!data.active" class="i-tabler:ban inline-block p-2 m-1 text-red-6"></div>
      </div>
      <div>中文名：{{ data.nick_name }}</div>
      <div>任务数：{{ data.statistics.tasks.all.total }}</div>
      <div>节点数：{{ data.statistics.nodes.all.total }}</div>
      <div v-if="showAdminMode">
        <Dropdown placement="bottomRight">
          <a class="ant-dropdown-link" @click.prevent> 管理 </a>
          <template #overlay>
            <Menu>
              <MenuItem
                :disabled="!canBanUser"
                @click="setUserActiveState(data.user_name, !data.active)"
              >
                <a>{{ data.active ? '禁用' : '恢复' }}用户 {{ data.usernameDisplay }}</a>
              </MenuItem>
              <MenuItem
                :disabled="!canSwitchTask"
                @click="openChangeUserScheduleZone(data.user_name)"
              >
                <a>修改 schedule zone</a>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
    </div>
    <UsersTrainingTableDrawerGroupManager :user="props.data" />
    <div class="px-2 py-1">
      <Row v-for="area in ['A', 'B'] as ('A' | 'B')[]" :key="area" :gutter="[16, 16]">
        <Col class="font-500" :span="2">{{ area }} 区</Col>
        <Col :span="3"
          ><span class="text-secondary mr-1">[任务]</span>
          <span class="font-500">{{ data.statistics.tasks[area].working }}</span></Col
        >
        <Col :span="3"
          ><span class="text-secondary mr-1">[节点]</span>
          <span class="font-500">{{ data.statistics.nodes[area][taskTypeKey] }}</span></Col
        >
      </Row>
    </div>
    <div class="w-full flex flex-row justify-between gap-2 p-1">
      <WrappedInputSearch
        v-model:value="taskOrGroupSearch"
        class="w-250px"
        placeholder="搜索任务/提交组"
      />
      <Button type="link" @click="() => setAllExpanded()"
        >全部{{ allExpanded ? '合起' : '展开' }}</Button
      >
    </div>
    <UsersTrainingTableDrawerTasksList
      :tasks="sortedTasks"
      :all-expanded="allExpanded"
      :task-type="taskType"
      :reschedule-zone="openChangeTaskScheduleZone"
    />
    <Modal
      v-model:visible="rescheduleVisible"
      title="更改schedule zone"
      @ok="submitChangeTaskScheduleZone"
    >
      将 [{{
        rescheduleInput.type === 'task'
          ? rescheduleInput.task_id
          : rescheduleInput.user_name + '的所有任务'
      }}] 调度到新区域：
      <RadioGroup v-model:value="rescheduleZone">
        <Radio :value="TaskScheduleZone.A">A</Radio>
        <Radio :value="TaskScheduleZone.B">B</Radio>
      </RadioGroup>
    </Modal>
  </div>
</template>
