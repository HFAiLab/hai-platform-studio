<script setup lang="ts">
import { InputNumber } from 'ant-design-vue'
import { computed } from 'vue'

const props = defineProps<{
  value: number
}>()

const emit = defineEmits<{
  (event: 'update:value', val: number): void
}>()

const value = computed({
  get() {
    return props.value
  },
  set(val) {
    emit('update:value', val)
  },
})

const title = '每组最大显示节点数量'
</script>

<template>
  <InputNumber v-model:value="value" :min="1" :title="title">
    <template #addonBefore>
      <span class="cursor-default" :title="title">显示节点数</span>
    </template>
  </InputNumber>
</template>
