<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheMainBreadcrumb from './TheMainBreadcrumb.vue'
import TheMainFooter from './TheMainFooter.vue'
import TheMainRefresh from './TheMainRefresh.vue'
</script>

<template>
  <div class="w-full">
    <div class="mx-auto w-full">
      <nav
        class="flex flex-row items-center justify-between p-4 sticky top-50px z-10"
        :style="{ backgroundColor: 'var(--layout-body-background)' }"
      >
        <TheMainBreadcrumb />

        <TheMainRefresh />
      </nav>

      <main class="px-4">
        <RouterView />
      </main>

      <TheMainFooter class="py-4" />
    </div>
  </div>
</template>
