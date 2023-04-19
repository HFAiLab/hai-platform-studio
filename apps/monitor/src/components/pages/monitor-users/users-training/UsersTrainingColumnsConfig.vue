<script setup lang="ts">
import { AdminGroup } from '@hai-platform/shared'
import type { TreeProps } from 'ant-design-vue'
import { Popover, TabPane, Tabs, Tree } from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/lib/tree'
import { computed, ref } from 'vue'
import { useConfig } from '@/composables'
import { usersTrainingColumnsTree, usersTrainingDetailColumns } from '@/data'
import { useAuthStore } from '@/stores'
import TipsPopoverItem from '../../../TipsPopoverItem.vue'

const { userTrainingTasksTableColumnsKeys1, userTrainingDetailTableColumnKeys } = useConfig()

const canEditQuota = computed(() =>
  useAuthStore().checkUserGroup([
    AdminGroup.INTERNAL_QUOTA_LIMIT_EDITOR,
    AdminGroup.EXTERNAL_QUOTA_EDITOR,
  ]),
)
const usersTrainingTasksColumnsTree = usersTrainingColumnsTree.filter(
  (col) => !(!canEditQuota.value && col.key.includes('quota')),
)
const usersTrainingDetailColumnsTree = usersTrainingDetailColumns as DataNode[]

const showLine: TreeProps['showLine'] = {
  showLeafIcon: false,
}

const activeKey = ref('overview')
</script>
<template>
  <Popover placement="bottomRight" trigger="click">
    <div class="border b-solid b-gray-3 rounded p-2 cursor-pointer">
      <div class="i-ant-design:setting-outlined text-secondary" />
    </div>
    <template #content>
      <TipsPopoverItem name="管理显示列"></TipsPopoverItem>
      <Tabs v-model:activeKey="activeKey">
        <TabPane key="overview" tab="用户任务列表">
          <div class="h-800px overflow-auto">
            <Tree
              v-model:checkedKeys="userTrainingTasksTableColumnsKeys1"
              :tree-data="usersTrainingTasksColumnsTree"
              checkable
              :show-line="showLine"
              default-expand-all
            ></Tree></div
        ></TabPane>
        <TabPane key="detail" tab="任务详情列表" force-render>
          <Tree
            v-model:checkedKeys="userTrainingDetailTableColumnKeys"
            :tree-data="usersTrainingDetailColumnsTree"
            checkable
            :show-line="showLine"
            default-expand-all
          ></Tree>
        </TabPane>
      </Tabs>
    </template>
  </Popover>
</template>
