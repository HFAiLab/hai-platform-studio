<script setup lang="ts">
import { Layout } from 'ant-design-vue'
import { useSidebar } from '@/composables'
import TheMain from './TheMain.vue'
import TheSidebar from './TheSidebar.vue'

const { width } = useSidebar()
</script>

<template>
  <Layout has-sider>
    <TheSidebar class="mt-header" />
    <TheMain class="transition-margin-200" :style="{ 'margin-left': `${width}px` }" />
  </Layout>
</template>
