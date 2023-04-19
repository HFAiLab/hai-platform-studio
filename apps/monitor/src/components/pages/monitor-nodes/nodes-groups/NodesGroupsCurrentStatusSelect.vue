<script setup lang="ts">
import { NodeCurrentStatus } from '@hai-platform/shared'
import { Select } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import { computed } from 'vue'
import NodeListItemStatus from '@/components/NodeListItemStatus.vue'

const props = defineProps<{
  value: NodeCurrentStatus[]
}>()

const emit = defineEmits<{
  (event: 'update:value', val: NodeCurrentStatus[]): void
}>()

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  },
})

const options: SelectProps['options'] = [
  {
    label: '工作中',
    value: NodeCurrentStatus.TRAINING_WORKING,
  },
  {
    label: '空闲',
    value: NodeCurrentStatus.TRAINING_FREE,
  },
  {
    label: '不可调度',
    value: NodeCurrentStatus.TRAINING_UNSCHEDULABLE,
  },
  {
    label: '异常',
    value: NodeCurrentStatus.ERR,
  },
  {
    label: '独占',
    value: NodeCurrentStatus.EXCLUSIVE,
  },
  {
    label: '待上线',
    value: NodeCurrentStatus.RELEASE,
  },
  {
    label: '开发',
    value: NodeCurrentStatus.DEV,
  },
  {
    label: '服务',
    value: NodeCurrentStatus.SERVICE,
  },
]
</script>

<template>
  <Select
    v-model:value="value"
    allow-clear
    mode="multiple"
    placeholder="节点状态"
    :options="options"
  >
    <template #option="option">
      <div class="flex flex-row items-center gap-2">
        <NodeListItemStatus :status="option.value" />
        <span>{{ option.label }}</span>
      </div>
    </template>
  </Select>
</template>
