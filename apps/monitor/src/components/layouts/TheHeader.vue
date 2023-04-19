<script setup lang="ts">
import { LayoutHeader } from 'ant-design-vue'
import TheHeaderMenu from './TheHeaderMenu.vue'
import TheHeaderTitle from './TheHeaderTitle.vue'
</script>

<template>
  <LayoutHeader class="position-fixed w-full z-10 flex">
    <TheHeaderTitle />
    <TheHeaderMenu class="flex-1" />
  </LayoutHeader>
</template>
