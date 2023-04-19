<script setup lang="ts">
import { Popover } from 'ant-design-vue'
</script>

<template>
  <Popover placement="bottomRight">
    <div class="i-ant-design:info-circle-outlined cursor-pointer text-secondary"></div>

    <template #content>
      <slot></slot>
    </template>
  </Popover>
</template>
