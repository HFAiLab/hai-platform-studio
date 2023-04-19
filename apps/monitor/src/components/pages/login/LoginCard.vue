<script setup lang="ts">
import { HAI_FOOT_STATEMENT_CN } from '@hai-platform/shared'
import { Button, Card, Checkbox, Form, FormItem, Input, InputPassword } from 'ant-design-vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthRouter, useAuthStore } from '@/stores'

const router = useRouter()
const authRouterStore = useAuthRouter()
const authStore = useAuthStore()
const loginFormState = reactive({
  username: authStore.username,
  token: authStore.token,
})
const isLoginLoading = ref(false)
const isLoginDisabled = computed(() => !loginFormState.username || !loginFormState.token)
const loginHelp = ref('')
const loginValidateStatus = computed(() => (loginHelp.value ? 'error' : ''))
const onClickLogin = async (): Promise<void> => {
  try {
    if (isLoginLoading.value) return
    isLoginLoading.value = true
    const result = await authStore.checkAuth(loginFormState)
    if (result === false) {
      loginHelp.value = '登录校验失败，请检查用户名和 Token'
    } else {
      await router.replace({ name: 'home' })
      authRouterStore.refreshAuthRouters()
    }
  } finally {
    isLoginLoading.value = false
  }
}
</script>

<template>
  <Card :title="HAI_FOOT_STATEMENT_CN" :bordered="false">
    <Form :model="loginFormState">
      <FormItem name="username">
        <Input v-model:value="loginFormState.username" placeholder="用户名">
          <template #prefix>
            <span class="i-ant-design:user-outlined"></span>
          </template>
        </Input>
      </FormItem>

      <FormItem name="token">
        <InputPassword v-model:value="loginFormState.token" placeholder="Token">
          <template #prefix>
            <span class="i-ant-design:lock-outlined"></span>
          </template>
        </InputPassword>
      </FormItem>

      <div class="mb-6 flex flex-row justify-between">
        <Checkbox v-model:checked="authStore.shouldRememberMe">记住我</Checkbox>
      </div>

      <FormItem
        :help="loginHelp"
        :validate-status="loginValidateStatus"
        :wrapper-col="{ span: 24 }"
        style=""
      >
        <Button
          type="primary"
          block
          :disabled="isLoginDisabled"
          :loading="isLoginLoading"
          @click="onClickLogin"
        >
          登录
        </Button>
      </FormItem>
    </Form>
  </Card>
</template>
