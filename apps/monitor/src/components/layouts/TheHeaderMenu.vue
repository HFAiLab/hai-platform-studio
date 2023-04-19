<script setup lang="ts">
import TheHeaderMenuAuth from './TheHeaderMenuAuth.vue'
import TheHeaderMenuDarkModeButton from './TheHeaderMenuDarkModeButton.vue'
import TheHeaderMenuRefreshPageButton from './TheHeaderMenuRefreshPageButton.vue'
</script>

<template>
  <span class="header-menu flex items-center justify-end px-4 gap-3 text-white">
    <TheHeaderMenuRefreshPageButton />
    <TheHeaderMenuDarkModeButton />
    <TheHeaderMenuAuth />
  </span>
</template>
