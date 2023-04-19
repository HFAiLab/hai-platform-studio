<script setup lang="ts">
import { Layout, LayoutContent } from 'ant-design-vue'
import LoginCard from '@/components/pages/login/LoginCard.vue'
</script>

<template>
  <Layout class="h-full">
    <LayoutContent class="xl:w-screen-xl w-full p-4 mx-auto">
      <LoginCard class="max-w-350px translate-y-5vh important-mx-auto" />
    </LayoutContent>
  </Layout>
</template>
