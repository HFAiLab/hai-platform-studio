<script setup lang="ts">
import type { CreateUserResult } from '@hai-platform/client-api-server'
import type { CreateUserSchema } from '@hai-platform/shared'
import { AdminGroup, UserRole } from '@hai-platform/shared'
import type { FormInstance } from 'ant-design-vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  InputGroup,
  InputNumber,
  Modal,
  Result,
  Select,
  SelectOption,
  Switch,
  Tooltip,
} from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form/interface'
import { difference, union } from 'lodash'
import { onMounted, reactive, ref, watch } from 'vue'
import { useConfig } from '@/composables'
import { QUOTA_COLUMNS } from '@/constants/default'
import { useAuthStore, useUserQuotaStore, useUsersStore } from '@/stores'
import { copyWithTip } from '@/utils/copyToClipboard'

const userQuotaStore = useUserQuotaStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

onMounted(() => {
  userQuotaStore.fetchData()
})

const { showAdminMode, showAllUsers, userTrainingTasksTableColumnsKeys1 } = useConfig()

watch(showAdminMode, (show) => {
  if (show) {
    userTrainingTasksTableColumnsKeys1.value = union(
      userTrainingTasksTableColumnsKeys1.value,
      QUOTA_COLUMNS,
    )
  } else {
    userTrainingTasksTableColumnsKeys1.value = difference(
      userTrainingTasksTableColumnsKeys1.value,
      QUOTA_COLUMNS,
    )
  }
})

const canCreateUser = authStore.checkUserGroup([
  AdminGroup.CLUSTER_MANAGER,
  AdminGroup.OPS,
  AdminGroup.DEVELOPER_ADMIN,
])
const createUserVisible = ref(false)
const createUserSubmitted = ref(false)
const createUserFormRef = ref<FormInstance>()
const createUserParams = reactive<CreateUserSchema>({
  user_name: '',
  shared_group: 'default',
  role: UserRole.INTERNAL,
  active: true,
})
const submitLoading = ref(false)
const createUserStatus = ref<'success' | 'error'>()
const createUserResult = ref<CreateUserResult>()

const createUserCheckRules: Record<string, Rule[]> = {
  user_name: [{ required: true, message: '用户名不能为空' }],
  shared_group: [{ required: true, message: '所属组不能为空' }],
  user_id: [{ type: 'number' }],
}

const openCreateUser = () => {
  createUserVisible.value = true
  submitLoading.value = false
  createUserSubmitted.value = false
}

const submitCreateUser = async () => {
  await createUserFormRef.value?.validateFields()
  submitLoading.value = true
  usersStore.createUser(
    createUserParams,
    (result: CreateUserResult) => {
      createUserResult.value = result
      submitLoading.value = false
      createUserStatus.value = 'success'
      createUserSubmitted.value = true
    },
    () => {
      submitLoading.value = false
      createUserStatus.value = 'error'
      createUserSubmitted.value = true
    },
  )
}
</script>

<template>
  <Switch v-model:checked="showAdminMode" />管理模式
  <!-- INTERNAL_DELETE_FRAGMENT_PREFIX -->
  <Switch v-model:checked="showAllUsers" />显示所有用户
  <Button :disabled="!canCreateUser" @click="openCreateUser">创建新用户</Button>
  <!-- INTERNAL_DELETE_FRAGMENT_SUFFIX -->
  <Modal v-model:visible="createUserVisible" title="创建新用户">
    <Form
      v-if="!createUserSubmitted"
      ref="createUserFormRef"
      :model="createUserParams"
      :rules="createUserCheckRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
    >
      <FormItem label="用户名" name="user_name">
        <Input
          v-model:value="createUserParams.user_name"
          placeholder="输入小写字母和数字, 不能与已有重复"
        />
      </FormItem>
      <FormItem label="所属组" name="shared_group">
        <Input
          v-model:value="createUserParams.shared_group"
          placeholder="用户所属组标识, 请使用小写字母/数字/下划线输入"
        />
      </FormItem>
      <FormItem label="用户 ID" name="user_id">
        <InputNumber
          v-model:value="createUserParams.user_id"
          placeholder="(可选) 用户 ID数字, 不能与已有ID重复"
          style="width: 100%"
        />
      </FormItem>
      <FormItem label="角色" name="role">
        <Select v-model:value="createUserParams.role">
          <SelectOption :value="UserRole.INTERNAL">内部用户</SelectOption>
          <SelectOption :value="UserRole.EXTERNAL">外部用户</SelectOption>
        </Select>
      </FormItem>
      <FormItem label="昵称" name="nick_name">
        <Input v-model:value="createUserParams.nick_name" placeholder="(可选) 填写用户中文名" />
      </FormItem>
      <FormItem label="激活状态" name="active">
        <Switch v-model:checked="createUserParams.active" />
      </FormItem>
    </Form>
    <div v-else>
      <Result
        v-if="createUserStatus === 'success'"
        status="success"
        :title="`已成功创建用户[${createUserResult?.user_id}]${createUserResult?.user_name}`"
        :sub-title="`用户Token已生成, 请妥善保存`"
      >
        <template #extra>
          <InputGroup compact>
            <Input :value="createUserResult?.token" style="width: calc(100% - 200px)" />
            <Tooltip title="复制token">
              <Button @click="createUserResult?.token && copyWithTip(createUserResult?.token)">
                <template #icon><div class="i-carbon:copy m-1.5"></div></template>
              </Button>
            </Tooltip>
          </InputGroup> </template
      ></Result>
      <Result v-else status="error" title="用户创建失败" />
    </div>
    <template #footer>
      <Button v-if="!createUserSubmitted" @click="submitCreateUser">确认创建</Button>
    </template>
  </Modal>
</template>
