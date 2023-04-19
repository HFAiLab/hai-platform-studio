<script setup lang="ts">
import { Avatar } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { stringToColor } from '@/utils'
import HeaderIconButton from './HeaderIconButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { username } = storeToRefs(authStore)
const avatarChar = computed(() => username.value.slice(0, 1).toUpperCase())
const avatarColor = computed(() => stringToColor(username.value))
const title = `退出登录`
const onClickLogout = (): void => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <template v-if="username">
    <Avatar :style="{ backgroundColor: avatarColor }">{{ avatarChar }}</Avatar>
    <span>{{ username }}</span>
    <HeaderIconButton
      id="monitor-v4-logout"
      icon="i-ant-design:logout-outlined"
      :title="title"
      @click="onClickLogout"
    />
  </template>
</template>
