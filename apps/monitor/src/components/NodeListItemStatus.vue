<script setup lang="ts">
import { computed } from 'vue'
import { COLORS_NODE_STATUS } from '@/constants'
import type { NodeCurrentStatus } from '@/data'

const props = defineProps<{
  status: NodeCurrentStatus
}>()

const statusColor = computed(() => COLORS_NODE_STATUS[props.status])
</script>

<template>
  <span class="w-2 h-2 rounded-2" :style="`background-color: ${statusColor}`"></span>
</template>
