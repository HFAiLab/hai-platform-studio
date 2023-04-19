<script setup lang="ts">
import type { NodesDataItem } from '@/data'
import NodeListItem from './NodeListItem.vue'

defineProps<{
  nodes: NodesDataItem[]
  referTaskId?: number
}>()
</script>

<template>
  <div class="flex flex-row flex-wrap gap-2 items-center">
    <template v-for="node in nodes" :key="node.name">
      <NodeListItem :data="node" :refer-task-id="referTaskId" />
    </template>

    <slot name="after"></slot>
  </div>
</template>
