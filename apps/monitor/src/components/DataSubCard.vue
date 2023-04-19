<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  isLoading?: boolean
  title?: string
  desc?: string
  bodyStyle?: CSSProperties
  containerStyle?: CSSProperties
  descStyle?: CSSProperties
  contentStyle?: CSSProperties
  contextmenuHandler?: (e: MouseEvent) => void
}>()
</script>

<template>
  <div
    :style="{ height: '100%', width: '100%', padding: '18px', ...containerStyle }"
    @contextmenu="contextmenuHandler"
  >
    <div
      v-if="!!$slots['options'] || !!title"
      class="flex flex-row item-center"
      :style="{ height: '40px' }"
    >
      <h4 v-if="!!title" :style="{ height: '40px' }" class="flex-1">{{ title }}</h4>
      <slot name="options"></slot>
    </div>

    <p v-if="!!$slots['desc']" class="m-0 text-secondary" :style="{ ...descStyle }">
      <slot name="desc"></slot>
    </p>

    <!-- 默认减去 title 部分，如果额外增加了内容需要使用者自己计算 -->
    <div :style="{ height: 'calc(100% - 40px)', ...contentStyle }">
      <slot></slot>
    </div>
  </div>
</template>
