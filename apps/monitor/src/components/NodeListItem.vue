<script setup lang="ts">
import NodeListItemStatus from '@/components/NodeListItemStatus.vue'
import TipsPopoverItem from '@/components/TipsPopoverItem.vue'
import { useConfig } from '@/composables'
import type { NodesDataItem } from '@/data'
import { useAuthStore, useNodesOverviewStore } from '@/stores'
import { AdminGroup, getDefaultErrorNodeMetaGroup, NodeCurrentStatus } from '@hai-platform/shared'
import { Button, Popover } from 'ant-design-vue'
import { computed } from 'vue'

const props = defineProps<{
  data: NodesDataItem
  referTaskId?: number
}>()
const { showAdminMode } = useConfig()

const canDisableNodes = computed(() =>
  useAuthStore().checkUserGroup([AdminGroup.CLUSTER_MANAGER, AdminGroup.OPS]),
)

const closed = computed(
  () => props.referTaskId !== undefined && props.referTaskId !== props.data.working_task_id,
)
const nodeStatus = computed(() =>
  closed.value ? NodeCurrentStatus.TRAINING_UNSCHEDULABLE : props.data.currentStatus,
)

const manuallyDisabled = computed(
  () =>
    props.data.mars_group?.startsWith(`${getDefaultErrorNodeMetaGroup()}.manually_disabled_by_`) ??
    false,
)

const tips = computed(() => [
  {
    name: '节点分组',
    value:
      props.data.mars_group +
        (props.data.origin_group !== props.data.mars_group ? `(${props.data.origin_group})` : '') ??
      '--',
  },
  ...(props.data.origin_group !== props.data.mars_group
    ? [
        {
          name: '原始分组',
          value: props.data.origin_group ?? '--',
        },
      ]
    : []),
  {
    name: '节点状态',
    value: closed.value ? 'closed' : props.data.currentStatus,
  },
  {
    name: '节点类型',
    value: props.data.type?.toUpperCase() ?? '--',
  },
  {
    name: '占用用户',
    value: props.data.workingUserDisplay ?? '--',
  },
  {
    name: '占用任务 ID',
    value: props.data.working_task_id ?? '--',
  },
  {
    name: 'CPU 核数',
    value: props.data.cpu,
  },
  {
    name: 'GPU 数量',
    value: props.data.gpu_num,
  },
  {
    name: 'Spine',
    value: props.data.spine ?? '--',
  },
  {
    name: 'Leaf',
    value: props.data.leaf ?? '--',
  },
])
</script>

<template>
  <Popover placement="bottom">
    <template #content>
      <TipsPopoverItem class="font-bold mb-2" :name="data.name" />

      <template v-for="{ name, value } in tips" :key="name">
        <TipsPopoverItem :name="name" :value="value" />
      </template>
      <div v-if="showAdminMode">
        <span v-if="manuallyDisabled" class="text-red-500 mr-5">[已禁用] </span>
        <Button
          type="link"
          :disabled="!canDisableNodes"
          @click="
            () =>
              useNodesOverviewStore().changeNodeState(
                data.name,
                manuallyDisabled ? 'enabled' : 'disabled',
              )
          "
        >
          {{ manuallyDisabled ? '恢复' : '禁用' }}节点
        </Button>
      </div>
    </template>

    <div
      class="display-inline-block b-solid b-1 b-base text-center cursor-pointer hover:bg-hover-light"
    >
      <div class="flex flex-row items-center gap-2 px-2 py-1">
        <NodeListItemStatus :status="nodeStatus" />
        <!-- 注意这里用等宽字体 -->
        <span class="font-mono text-main">{{ data.name }}</span>
      </div>
    </div>
  </Popover>
</template>
