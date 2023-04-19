<script setup lang="ts">
defineProps<{
  icon: string
}>()
const emit = defineEmits(['click'])
</script>

<template>
  <span
    class="hover-cursor-pointer mx-1 text-1.1rem"
    :class="icon"
    role="button"
    @click="emit('click')"
  >
  </span>
</template>
