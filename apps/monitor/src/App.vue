<script setup lang="ts">
import { BackTop, ConfigProvider, Layout } from 'ant-design-vue'
import zhCnLocale from 'ant-design-vue/es/locale/zh_CN'
import { RouterView } from 'vue-router'
import TheHeader from '@/components/layouts/TheHeader.vue'
</script>

<template>
  <ConfigProvider :locale="zhCnLocale">
    <Layout class="h-full w-full">
      <TheHeader />
      <RouterView class="mt-header" />
      <BackTop />
    </Layout>
  </ConfigProvider>
</template>
