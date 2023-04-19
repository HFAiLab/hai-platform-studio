<script setup lang="ts">
import NodesGroups from '@/components/pages/monitor-nodes/NodesGroups.vue'
import { useRefresh } from '@/composables'
import { useNodesOverviewStore, useUsersStore, useVersionStore } from '@/stores'

const { refresh, setRefresh } = useRefresh()

setRefresh([
  useVersionStore().checkHasNewVersion,
  useNodesOverviewStore().fetchData,
  useUsersStore().fetchData,
])

refresh()
</script>

<template>
  <div class="grid gap-4 grid-cols-1">
    <!-- 1st row -->
    <NodesGroups class="col-span-1" />
  </div>
</template>
