<script setup lang="ts">
import { Card, Spin } from 'ant-design-vue'

defineProps<{
  isLoading: boolean
  title: string
  // 中间隔了一层 spin ，目前通过 style 设置高度
  height: number
}>()
</script>

<template>
  <Card :bordered="false" :body-style="{ height: '100%' }">
    <Spin :spinning="isLoading">
      <div class="flex flex-col justify-between" :style="{ height: `${height}px` }">
        <div class="flex flex-row justify-between items-center mb-1 text-secondary truncate">
          <span>{{ title }}</span>
          <slot name="extra"></slot>
        </div>
        <slot></slot>
      </div>
    </Spin>
  </Card>
</template>
