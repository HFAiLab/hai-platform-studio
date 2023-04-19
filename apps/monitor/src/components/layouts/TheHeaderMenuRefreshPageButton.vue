<script setup lang="ts">
import { Button, Tooltip } from 'ant-design-vue'
import { useVersionStore } from '@/stores'

const versionStore = useVersionStore()

const refresh = (): void => {
  window.location.reload()
}
</script>

<template>
  <Tooltip v-if="versionStore.hasNewVersion">
    <template #title> 检测到新版本发布，建议刷新页面更新 </template>
    <Button size="small" type="primary" danger ghost @click="refresh">新版本</Button>
  </Tooltip>
</template>
