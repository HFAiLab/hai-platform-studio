<script setup lang="ts">
import { copyWithTip } from '@/utils'

defineProps<{
  name: string | number
  value?: string | number
  title?: string
}>()
</script>

<template>
  <div
    class="flex flex-row justify-between gap-2 hover:bg-hover px-1 mx--1 rounded-0.5 cursor-copy select-none"
    :title="title"
    @click="() => copyWithTip(String(value ?? name))"
  >
    <span>{{ name }}</span>
    <span v-if="value !== undefined">{{ value }}</span>
  </div>
</template>
