<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  max: number
  color: string
}>()

const style = computed(() => ({
  'background-color': props.color,
  // 可能会有异常数据导致超过 100
  'width': `${Math.min((props.value / props.max) * 100, 100)}%`,
}))
</script>

<template>
  <div class="w-full h-3px">
    <div class="h-full transition-width-200" :style="style"></div>
  </div>
</template>
