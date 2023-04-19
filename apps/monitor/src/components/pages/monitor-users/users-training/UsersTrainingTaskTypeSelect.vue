<script setup lang="ts">
import { RadioButton, RadioGroup } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import { computed } from 'vue'
import { TaskTrainingType } from '@/constants'

const props = defineProps<{
  value: TaskTrainingType
}>()

const emit = defineEmits<{
  (event: 'update:value', val: TaskTrainingType): void
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
  ...[TaskTrainingType.GPU, TaskTrainingType.CPU].map((item) => ({
    label: item,
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
