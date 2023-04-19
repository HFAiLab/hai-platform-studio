<script setup lang="ts">
import { UserRole } from '@hai-platform/shared'
import { RadioButton, RadioGroup } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import { computed } from 'vue'

const props = defineProps<{
  value: UserRole | '_ALL_'
}>()

const emit = defineEmits<{
  (event: 'update:value', val: UserRole | '_ALL_'): void
}>()

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  },
})

const roleLabelMap = {
  _ALL_: '全部',
  [UserRole.INTERNAL]: '内部用户',
  [UserRole.EXTERNAL]: '外部用户',
} as { [key: string]: string }

const options: SelectProps['options'] = [
  ...['_ALL_', UserRole.INTERNAL, UserRole.EXTERNAL].map((item) => ({
    label: roleLabelMap[item as string],
    value: item,
  })),
]
</script>

<template>
  <RadioGroup v-model:value="value">
    <RadioButton v-for="option in options" :key="option.value!" :value="option.value">{{
      option.label
    }}</RadioButton>
  </RadioGroup>
</template>
