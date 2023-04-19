<script setup lang="ts">
import { InputSearch } from 'ant-design-vue'
import { ref } from 'vue'

const props = defineProps<{
  value: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:value', val: string): void
}>()

const inputValue = ref(props.value)

const onSearch = (): void => {
  emit('update:value', inputValue.value)
}
</script>

<template>
  <div>
    <InputSearch
      v-model:value="inputValue"
      allow-clear
      :placeholder="placeholder"
      @search="onSearch"
    />
  </div>
</template>
