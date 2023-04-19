<script setup lang="ts">
import TipsPopover from '@/components/TipsPopover.vue'
import TipsPopoverItem from '@/components/TipsPopoverItem.vue'
import type { UsersJupyter } from '@/data'

defineProps<{
  usersJupyter: UsersJupyter
}>()
</script>

<template>
  <TipsPopover>
    <TipsPopoverItem name="Jupyter 用户数" :value="usersJupyter.usersData.length" />
    <TipsPopoverItem name="Jupyter 任务数" :value="usersJupyter.tasks.length" />
    <TipsPopoverItem name="Jupyter 节点数" :value="usersJupyter.nodes.length" />
  </TipsPopover>
</template>
