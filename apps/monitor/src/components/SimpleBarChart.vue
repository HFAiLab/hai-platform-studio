<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  series: { name: string; value: number; valueDisplay?: string; color: string }[]
  activeItem?: { name: string } | null
  hoverItem?: { name: string } | null
}>()

const maxValue = computed(() => props.series.reduce((result, item) => result + item.value, 0))
const items = computed(() =>
  props.series.map((item) => {
    return {
      ...item,
      class: {
        active: props.activeItem?.name === item.name,
        hover: props.hoverItem?.name === item.name,
      },
      style: {
        'background-color': item.color,
        'width': maxValue.value ? `${(item.value / maxValue.value) * 100}%` : '0',
      },
    }
  }),
)
</script>

<template>
  <div class="h-20px w-full">
    <template v-for="item in items" :key="item.name">
      <span
        class="bar-item display-inline-block h-20px cursor-pointer transition-width-200"
        :class="item.class"
        :style="item.style"
        :title="`${item.name} ${item.valueDisplay ?? item.value}`"
      ></span>
    </template>
  </div>
</template>

<style scoped>
.bar-item:hover,
.bar-item.hover {
  box-shadow: inset 0px 0px 0px 10px rgba(255, 255, 255, 20%);
}
.bar-item.active {
  box-shadow: inset 0px 0px 0px 10px rgba(255, 255, 255, 50%);
}
</style>
