<script setup lang="ts">
import { AdminGroup } from '@hai-platform/shared'
import { Button, Select } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import { useConfig } from '@/composables'
import type { UsersTrainingUsersDataItem } from '@/data'
import { useAuthStore, useUsersStore } from '@/stores'

const props = defineProps<{
  user: UsersTrainingUsersDataItem
}>()

const usersStore = useUsersStore()
const authStore = useAuthStore()
const { showAdminMode } = useConfig()
const showGroupAdmin = computed(() => showAdminMode && authStore.checkUserGroup(AdminGroup.ROOT))
const selectValues = ref<string[]>(props.user.user_groups)
const handleChange = () => {
  usersStore.updateUserGroups(props.user.user_name, selectValues.value)
}

watch(
  () => props.user.user_name,
  () => {
    selectValues.value = props.user.user_groups
  },
)
</script>
<template>
  <div v-if="showAdminMode" class="m-1">
    <div class="text-secondary mb-1 ml-1 flex justify-between">
      <div>修改用户权限组</div>
      <Button size="small" :disabled="!showGroupAdmin" @click="handleChange">保存</Button>
    </div>
    <Select
      v-model:value="selectValues"
      :disabled="!showGroupAdmin"
      mode="tags"
      style="width: 100%"
      placeholder="用户组权限"
      :options="
        usersStore.userGroups.map((g) => ({
          value: g,
          label: g,
          disabled: ['public', 'internal', 'external'].includes(g),
        }))
      "
    ></Select>
  </div>
</template>
