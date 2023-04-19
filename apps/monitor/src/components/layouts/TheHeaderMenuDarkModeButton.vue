<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { computed } from 'vue'
import { useIsDarkMode } from '@/composables'
import HeaderIconButton from './HeaderIconButton.vue'

const isDarkMode = useIsDarkMode()
const toggleDarkMode = useToggle(isDarkMode)
const icon = computed(() => (isDarkMode.value ? 'i-carbon:moon' : 'i-carbon:sun'))
const title = '切换颜色模式'
</script>

<template>
  <HeaderIconButton :icon="icon" :title="title" @click="toggleDarkMode" />
</template>
