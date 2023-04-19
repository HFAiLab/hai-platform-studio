<script setup lang="ts">
import { Card, Spin } from 'ant-design-vue'
import type { CSSProperties } from 'vue'
import { inject } from 'vue'

defineProps<{
  isLoading: boolean
  title: string
  bodyStyle?: CSSProperties
}>()

const refreshing = inject<boolean>('refreshing')
</script>

<template>
  <Card :bordered="false" :body-style="bodyStyle">
    <template #title>
      <span class="text-secondary">{{ title }}</span>
    </template>

    <template #extra>
      <div class="flex flex-row items-center gap-4">
        <slot name="extra"></slot>
        <div
          v-if="refreshing"
          class="i-ant-design:sync-outlined cursor-pointer animate-duration-2s animate-spin"
          title="正在更新数据"
        ></div>
      </div>
    </template>

    <Spin :spinning="isLoading">
      <slot></slot>
    </Spin>
  </Card>
</template>
